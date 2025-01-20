import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startVideo();
    if (videoRef) {
      loadModels();
    }
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current!.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadModels = async () => {
    try {
      // モデルのロードが完了するまで待つ
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      console.log("モデル1:");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      console.log("モデル2:");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      console.log("モデル3:");

      // モデルが読み込まれたら顔認識開始
      faceMydetect();
    } catch (error) {
      console.error("モデルの読み込みに失敗しました:", error);
    }
  };

  const faceMydetect = () => {
    setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvasRef.current.innerHTML = "";
        canvasRef.current.append(canvas);
        faceapi.matchDimensions(canvas, { width: 940, height: 650 });

        faceapi.draw.drawDetections(canvas, detections);
      }
    }, 100);
  };

  return (
    <div>
      <h1>顔認識アプリ</h1>
      <video crossOrigin="anonymous" id="video" ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} width={940} height={650} className="appcanvas"></canvas>
    </div>
  );
};

export default FaceRecognition;
