// 星童猫咪吉祥物「小星」：奶油色圆猫 + 雾青围巾。
// 设计原则：圆润、无害、永远微笑——让孩子和家长第一眼就感到安全。
export default function Mascot({
  size = 96,
  bubble,
  className = "",
}: {
  size?: number;
  bubble?: string; // 可选：气泡文案，吉祥物开口说话
  className?: string;
}) {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`} style={{ width: size }}>
      {bubble && (
        <div className="msg-in relative mb-2 max-w-[220px] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-[13px] leading-relaxed text-ink shadow-soft">
          {bubble}
        </div>
      )}
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="吉祥物小星">
        {/* 围巾飘尾 */}
        <path d="M84 78 q18 6 14 22 q-12 -4 -20 -12 z" fill="#7FBEC7" />
        {/* 身体 */}
        <ellipse cx="60" cy="82" rx="34" ry="26" fill="#F6E7CE" />
        {/* 耳朵 */}
        <path d="M30 40 L24 16 L48 30 z" fill="#F6E7CE" />
        <path d="M90 40 L96 16 L72 30 z" fill="#F6E7CE" />
        <path d="M33 36 L29 22 L44 31 z" fill="#EFB98A" />
        <path d="M87 36 L91 22 L76 31 z" fill="#EFB98A" />
        {/* 头 */}
        <circle cx="60" cy="52" r="32" fill="#F6E7CE" />
        {/* 头顶小星星 */}
        <path d="M60 12 l3.2 6.8 7.3 .9 -5.4 5 1.4 7.2 -6.5 -3.6 -6.5 3.6 1.4 -7.2 -5.4 -5 7.3 -.9 z" fill="#F0B429" />
        {/* 眼睛：弯月笑眼 */}
        <path d="M42 50 q5 -6 10 0" stroke="#4A4238" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M68 50 q5 -6 10 0" stroke="#4A4238" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* 腮红 */}
        <circle cx="38" cy="60" r="5" fill="#F2A9A0" opacity=".65" />
        <circle cx="82" cy="60" r="5" fill="#F2A9A0" opacity=".65" />
        {/* 鼻子和嘴 */}
        <path d="M57 58 h6 l-3 4 z" fill="#D4755E" />
        <path d="M60 62 q-3 5 -8 4 M60 62 q3 5 8 4" stroke="#4A4238" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* 胡须 */}
        <path d="M24 54 h10 M26 62 l9 -3 M86 54 h10 M85 59 l9 3" stroke="#C9B99C" strokeWidth="2" strokeLinecap="round" />
        {/* 围巾 */}
        <path d="M30 74 q30 14 60 0 l0 10 q-30 14 -60 0 z" fill="#7FBEC7" />
        {/* 尾巴 */}
        <path d="M92 92 q20 2 16 -14" stroke="#F6E7CE" strokeWidth="10" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
