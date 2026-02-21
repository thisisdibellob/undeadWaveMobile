import { useEffect, useState } from 'react';
import './StartMenu.css'; // 기존 style.css 내용을 여기로

function StartMenu({ onStart }) {
  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollValue(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="start-menu">
      <header style={{ top: scrollValue * 0.5 + 'px' }}>
        <a href="#" className="logo"></a>
        <ul>
          <li><a href="#" className="active">홈</a></li>
          <li><a href="#sec">스토리</a></li>
          <li><a href="#play">조작 방식</a></li>
        </ul>
      </header>

      <section className="parallax-section">
        <img src="/assets/startMenu/stars.png" id="stars" style={{ left: scrollValue * 0.25 + 'px' }} />
        <img src="/assets/startMenu/moon.png" id="moon" style={{ top: scrollValue * 1.05 + 'px' }} />
        <img src="/assets/startMenu/mountains_behind.png" id="mountains_behind" style={{ top: scrollValue * 0.5 + 'px' }} />
        
        <h2 id="text" style={{left: '25%', marginTop: (scrollValue * 1.5 - 50) + 'px', zIndex: 100}}>
          Undead Wave
        </h2>
        
        <button onClick={onStart} id="btn" style={{ marginTop: scrollValue * 1.5 + 'px' }}>
          게임시작
        </button>

        <img src="/assets/startMenu/mountains_front.png" id="mountains_front" />
        <img src="/assets/startMenu/zombie.png" id="zombie" style={{ left: (570 + scrollValue * 0.3) + 'px' }} />
      </section>

      {/* 스토리 및 조작 방식 섹션은 기존 HTML 내용을 그대로 넣어주세요 */}
      <div className="sec" id="sec">
        <h2>게임 스토리</h2>
        <p>좀비 아포칼립스 세상</p>
        <p>어느 날 갑자기 전 세계에 원인을 알 수 없는 바이러스가 퍼져 사람들이 좀비로 변했습니다.</p>
        <p>플레이어는 살아남은 생존자 중 한 명이 되어 끝없이 몰려오는 좀비 무리 속에서 버텨야 합니다.</p>
        <p>좀비를 해치우고 무기와 스킬을 얻어 생존하세요.</p>
        <img src="/assets/startMenu/story_image.jpeg" width="300" height="200"></img>
      </div>

      <div className="sec" id="play">
        <h2>조작 방식</h2>
        {/* 이동방식 */}
        <div id="mov">
        <div>
            <p>이동방식</p>
            <img src="/assets/startMenu/W.png" className="space" style={{ marginRight: '65px' }}></img>
            <br></br>
            <img src="/assets/startMenu/A_black.png"></img>
            <img src="/assets/startMenu/S.png"></img>
            <img src="/assets/startMenu/D_black.png"></img>
        </div>
        <div>
            <img src="/assets/startMenu/run.gif" width="100px"></img>
        </div>
        </div>
        
        {/* 공격 */}
        <div className="attack-section">
        <p>공격</p>
        <div>
            <img src="/assets/startMenu/shot.gif" style={{width:"100px"}}></img>
            <img src="/assets/startMenu/bullet1.png" style={{width:"30px"}}></img>
            <img src="/assets/startMenu/zombie-hurt.gif" style={{width:"100px"}}></img>
            <img src="/assets/startMenu/mouse.gif"></img>
            <img src="/assets/startMenu/Touch.png"></img>
        </div>
        </div>
        
        {/* 스킬 Shift */}
        <div className="pand">
        <p>스킬 Shift 구르기</p>
        <div>
            <img src="/assets/startMenu/shift.gif"></img>
            <img src="/assets/startMenu/roll.png" style={{width:"100px", height:"96px"}}></img>
        </div>
        </div>
        
        {/* 스킬 E */}
        <div className="pand">
        <p>스킬 E 광선 공격</p>
        <div>
            <img src="/assets/startMenu/E.gif"></img>
            <img src="/assets/startMenu/Ray.png" style={{width:"250px", height:"96px"}}></img>
        </div>
        </div>
        
        {/* 스킬 Q */}
        <div className="pand">
        <p>스킬 Q 백스탭 공격</p>
        <div>
            <img src="/assets/startMenu/Q.gif"></img>
            <img src="/assets/startMenu/Backstep.png" style={{width:"200px", height:"150px"}}></img>
        </div>
        </div>
        
        {/* 스킬 R */}
        <div className="pand">
        <p>스킬 R 회오리</p>
        <div>
            <img src="/assets/startMenu/R.gif"></img>
            <img src="/assets/startMenu/Tornado.png" style={{width:"400px", height:"350px"}}></img>
        </div>
        </div>
      </div>

    </div>
  );
}

export default StartMenu;