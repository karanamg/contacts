"use client";

import {useState, useEffect, useRef, useCallback, forwardRef} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Camera as CameraIcon, Check, Loader2} from "lucide-react";

interface CameraProps {
  onCapture: (photo: string) => void;
  loading: boolean;
}

const Camera = forwardRef<HTMLVideoElement, CameraProps>(({onCapture, loading}, ref) => {
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {facingMode: "environment"},
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err: any) {
        setError("Camera access denied or no camera found.");
        console.error(err);
      }
    };

    getVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-4">
        <video
          ref={videoRef}
          className="w-full rounded-md shadow-sm"
          autoPlay
          muted
        ></video>
        <canvas ref={canvasRef} style={{display: "none"}}></canvas>
        <Button
          onClick={capture}
          disabled={!hasCamera || loading}
          className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CameraIcon className="mr-2 h-4 w-4"/>
              <span>Capture</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

Camera.displayName = "Camera";

export {Camera};
