import { useEffect, useRef, useState } from "react";
import * as faceapi from 'face-api.js';

const FaceRecognition = () => {
  // const [imageUrl, setImageUrl] = useState<string>("");
  // const [inputImage, setInputImage] = useState<HTMLImageElement | null>(null);
  const [detections, setDetections] = useState<any>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null); // video の参照を管理
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // canvas の参照を管理

  // カメラのストリームを取得
  const getVideoStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream; // video にストリームを設定
      videoRef.current.play(); // 再生開始
    }

    // Video のロードが完了したタイミングで顔認識を開始
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = videoRef.current!.videoWidth;
            canvas.height = videoRef.current!.videoHeight;
            detectFace(videoRef.current!, canvas, context);
          }
        }
      };
    }
  };

  // 顔認識処理
  const detectFace = async (video: HTMLVideoElement, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D | null) => {
    if (!context) return;

    // モデルが読み込まれていることを確認してから推論を行う
    if (!faceapi.nets.ssdMobilenetv1) {
      console.log("モデルが読み込まれていません");
      return;
    }

    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    setDetections(detections);

    faceapi.draw.drawDetections(canvas, detections);
    faceapi.draw.drawFaceLandmarks(canvas, detections);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('モデル読込中。。');
        // モデルを読み込む
        await faceapi.nets.ssdMobilenetv1.loadFromUri('../../public/models');
        console.log('ssdMobilenetv1 モデルの読み込み完了');
        await faceapi.nets.faceLandmark68Net.loadFromUri('../../public/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('../../public/models');

        // モデルが全て読み込まれてからカメラを起動
        getVideoStream();
      } catch {
        console.log('モデル読込失敗');
      }
    };

    loadModels();
  }, []);

  return (
    <div>
      <h1>顔認識デモ</h1>
      <div style={{ position: "relative" }}>
        {/* 画面にカメラの映像を表示する */}
        <video ref={videoRef} width="640" height="480" style={{ position: "absolute", top: 50, left: 0 }} autoPlay muted></video>
        {/* 顔認識結果を描画するキャンバス */}
        <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", top: 50, left: 0 }} />
      </div>
      <button onClick={getVideoStream}>カメラを起動</button>
    </div>
  );
};

export default FaceRecognition;
