export function HomePersonalSystem({
  progress,
  onAccount,
}: {
  progress: number;
  onAccount: () => void;
}) {
  const cells = Array.from({length: 84},(_,index)=>{
    const value=(index*29+17)%100;
    return value < 36 ? 0 : value < 61 ? 1 : value < 82 ? 2 : 3;
  });

  return (
    <section className="future-scene future-personal" data-home-scene="personal">
      <div className="personal-profile-frame" data-parallax>
        <div className="personal-avatar">VM</div>
        <div className="personal-profile-copy">
          <small>LOCAL IDENTITY / VISUAL LEARNER</small>
          <strong>YOUR SYSTEM</strong>
          <span>course mastery {progress}%</span>
        </div>
        <div className="personal-ring" style={{ "--p": progress + "%" } as React.CSSProperties}><i/></div>
      </div>

      <div className="personal-main" data-reveal>
        <div className="future-kicker"><span>PERSONAL SYSTEM</span><i>LOCAL + FUTURE BACKEND</i></div>
        <h2>Не аккаунт.<br/><em>Твой слой системы.</em></h2>
        <div className="personal-features">
          <span>ACTIVITY</span><span>SAVED KNOWLEDGE</span><span>THEMES</span><span>MUSIC</span><span>PROGRESS</span>
        </div>
        <button className="future-link-button" onClick={onAccount}>OPEN PROFILE <span>↗</span></button>
      </div>

      <div className="personal-heatmap" aria-hidden="true">
        {cells.map((level,index)=><i key={index} data-level={level}/>)}
      </div>
    </section>
  );
}
