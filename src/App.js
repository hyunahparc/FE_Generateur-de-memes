import React, { useRef, useEffect, useState } from "react";
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const [memes, setMemes] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 700;

  // 파일 선택 시 실행되는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;

    image.onload = () => {
      const ctx = canvasRef.current.getContext("2d");
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

    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "48px sans-serif";
    ctx.fillStyle = "green";
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // 저장 버튼 클릭 시 함수
  const handleSaveClick = () => {
    const url = canvasRef.current.toDataURL("image/jpeg", 0.7); // 이미지 URL 얻기
    // 내 컴퓨터에 다운로드
    const a = document.createElement("a");
    a.href = url;
    a.download = "myMeme.jpg";
    a.click();

    // localStorage 저장
    const newMemes = [...memes, url]; // 기존 배열에 새 밈 추가
    localStorage.setItem("memes", JSON.stringify(newMemes)); // 로컬 스토리지에 저장
    setMemes(newMemes);
  }

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
