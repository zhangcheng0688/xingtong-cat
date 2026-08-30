import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 温馨调性：奶油底、暖炭文字（无刺眼的纯黑）、蜜柑金、雾青、暖珊瑚
        paper: "#FAF6EE",
        cream: "#FFFDF7",
        ink: "#4A4238",
        inklight: "#7A6F63",
        star: "#F0B429",
        stardeep: "#DE911D",
        night: "#3D362C",
        mist: "#EDE6D6",
        sage: "#5E9387",
        sagebg: "#EDF4F0",
        teal: "#7FBEC7",
        tealbg: "#EAF5F6",
        rose: "#D4755E",
        rosebg: "#F9ECE7",
        apricot: "#F2A65A",
      },
      fontFamily: {
        sans: ['-apple-system', '"Yuanti SC"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', "sans-serif"],
        serif: ['"Songti SC"', '"STSong"', '"Noto Serif SC"', "serif"],
      },
      boxShadow: {
        soft: "0 2px 16px rgba(46,58,82,0.07)",
        lift: "0 8px 32px rgba(46,58,82,0.12)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
} satisfies Config;
