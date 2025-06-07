import React, { useRef, useEffect, useState } from "react";
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const [memes, setMemes] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [sharedUrl, setSharedUrl] = useState(null);

  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 700;

  // 파일 선택 시 캔버스에 이미지 띄우기
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;

    image.onload = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH ,CANVAS_HEIGHT);
      fileInputRef.current.value = null; // 파일 input 초기화
    };
  };

  // 더블 클릭 시 텍스트 추가하는 함수
  const handleDoubleClick = (e) => {
    const text = textInputRef.current.value;
    if (text.trim() === "") return; // 공백이면 종료

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 마우스 좌표 계산
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.font = "48px sans-serif";
    ctx.fillStyle = "green";
    ctx.fillText(text, x, y);
  };

  // 서버에 이미지 업로드하기 (base64 문자열 보내기)
  const uploadImage = async(base64Url) => {
    try {
      console.log("[1] 업로드 시작: base64 문자열 일부 확인 →", base64Url.slice(0, 100)); // 앞 100자만 출력
      
      const response = 
      await fetch("http://localhost:8080/api/images/upload", {
      // await fetch("ngrokdomain/api/images/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image : base64Url})
      });
      
      console.log("[2] 서버 응답 상태 코드:", response.status);

      if(!response.ok) {
        throw new Error("업로드 실패");
      }

      const url = await response.text();
      console.log("[3] 서버에서 받은 URL:", url);

      return url;
    } catch(error) {
      console.error("[ERROR] 업로드 중 오류 발생:", error);
      return null;
    }
  };

  // 공유 버튼 클릭 시 (클립보드 복사 및 새탭 열기)
  const handleShareClick = () => {
    if (!sharedUrl) {
      alert("먼저 이미지를 저장하세요!");
      return;
    }
    navigator.clipboard.writeText(sharedUrl)
      .then(() => {
        window.open(sharedUrl, "_blank");
        alert("공유 URL이 클립보드에 복사되었습니다!");
      })
      .catch(() => alert("복사에 실패했습니다."));
  };


  // 저장 버튼 클릭 시 함수
  const handleSaveClick = async () => {
    const base64Url = canvasRef.current.toDataURL("image/jpeg", 0.7); // 이미지 URL 얻기
    
    // 1. 내 컴퓨터에 다운로드
    const a = document.createElement("a");
    a.href = base64Url;
    a.download = "myMeme.jpg";
    a.click();

    // 2. localStorage 저장
    const newMemes = [...memes, base64Url]; // 기존 배열에 새 밈 추가
    localStorage.setItem("memes", JSON.stringify(newMemes)); // 로컬 스토리지에 저장
    setMemes(newMemes);

    // 3. 서버에 업로드
    console.log("Uploading...");
    const url = await uploadImage(base64Url);
    console.log("Response from server: ", url);
    if(url) {
      setSharedUrl(url);
      alert("서버 업로드 성공! 공유하려면 공유버튼을 누르세요.");
    } else {
      alert("서버 업로드 실패");
    }
  };

  // 페이지 처음 로드될 때 locaStorage에서 저장된 이미지 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("memes") || "[]");
    setMemes(saved);
  }, []);

  return (
    <div className="App">
      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onDoubleClick={handleDoubleClick}
      ></canvas>
      <div className="btns">
        {/* 사진 업로드 */}
        <label htmlFor="file">
          Add photo
          <input 
            type="file" 
            id="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
        {/* 텍스트 입력 */}
        <input 
          type="text" 
          id="text"
          placeholder="쓰고 더블클릭하세요."
          ref={textInputRef} 
        />
        {/* 이미지 저장하기 */}
        <button id="save" onClick={handleSaveClick}>
          이미지 저장하기
        </button>
        {/* 저장된 이미지 갤러리 */}
        <button onClick={()=> setShowGallery(prev => !prev)}>
          {showGallery? "갤러리 클로즈 🎞️" : "갤러리 오쁜 🎞️"}
        </button>
        <button onClick={handleShareClick} disabled={!sharedUrl}>
          공유하기 🔗
        </button>
      </div>
      <div className={`gallery-sidebar ${showGallery ? "open" : ""}`}>
        <h2 style={{ fontSize: '30px' }}> 🎞️ My meme gallery 🎞️</h2>
        {showGallery && (
          <div id="gallery" className="gallery">
            {memes.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`meme-${index}`}
                className="gallery-img"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
