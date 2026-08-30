import { NextRequest, NextResponse } from "next/server";
import { store, type Post } from "@/lib/store";

// 社区种子内容（首次访问时注入，营造同伴支持氛围）
const SEED_POSTS: Post[] = [
  {
    id: "seed-1",
    topic: "情绪崩溃",
    title: "超市崩溃现场，我第一次没有跟着炸",
    content:
      "以前乐乐在超市一躺地我就慌，要么妥协买玩具，要么吼他。昨天用了课里学的：蹲下来、只说『妈妈在，不买，回家』。他哭了大概 4 分钟自己起来了。原来我平静，他真的会跟着平静。",
    author: "乐乐妈",
    likes: 46,
    comments: [
      { id: "c1", author: "康复师王老师", content: "教科书级的共同调节！崩溃期不讲道理、先降载，你做到了。", createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "c2", author: "豆豆爸爸", content: "学习了，下次我也试试先管自己的情绪。", createdAt: new Date(Date.now() - 80000000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 90000000).toISOString(),
  },
  {
    id: "seed-2",
    topic: "经验分享",
    title: "视觉日程表救了我们家的早晨",
    content:
      "把起床→穿衣→刷牙→早饭做成 4 张图贴在卧室门口，第三天开始，早上起来不用催了。孩子自己会去指下一张。视觉真的比唠叨管用一百倍。",
    author: "果果奶奶",
    likes: 38,
    comments: [
      { id: "c3", author: "星童猫咪·教研组", content: "视觉支持的精髓就是「可预期」。可以试试加上计时器做活动转换预告。", createdAt: new Date(Date.now() - 170000000).toISOString() },
    ],
    isExpert: false,
    createdAt: new Date(Date.now() - 180000000).toISOString(),
  },
  {
    id: "seed-3",
    topic: "专家答疑",
    title: "专家答疑：孩子只肯吃 5 种食物怎么办？",
    content:
      "挑食在 ASD 孩子里太常见了，多数是口感和气味敏感，不是故意作对。原则：尊重安全食物清单，从已接受的食物渐变扩展（同口感换味道、同味道换形状）。新食物放一小口在盘边，看一看闻一闻都算进步。千万不要强迫进食或把食物混进去骗孩子——信任一旦破坏，进食问题会升级。（本周答疑由教研组整理自 BCBA 督导意见）",
    author: "星童猫咪·教研组",
    likes: 52,
    comments: [],
    isExpert: true,
    createdAt: new Date(Date.now() - 260000000).toISOString(),
  },
  {
    id: "seed-4",
    topic: "互相取暖",
    title: "确诊半年，今晚终于可以睡着觉了",
    content:
      "刚确诊那阵子天天失眠，觉得天塌了。半年下来，孩子从无口语到会主动递卡片要东西，我也从崩溃妈妈变成半个行家。想对新家长说：路很长，但你不是一个人，我们都在。",
    author: "小宇妈妈",
    likes: 89,
    comments: [
      { id: "c4", author: "乐乐妈", content: "看哭了。谢谢你，新家长收到了力量。", createdAt: new Date(Date.now() - 300000000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 340000000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  store.seedPosts(SEED_POSTS);
  const topic = req.nextUrl.searchParams.get("topic");
  let posts = store.listPosts();
  if (topic) posts = posts.filter((p) => p.topic === topic);
  return NextResponse.json({
    posts,
    topics: ["全部", "情绪崩溃", "经验分享", "专家答疑", "互相取暖"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const { topic, title, content, author } = await req.json();
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "标题和内容都要填写" }, { status: 400 });
    }
    const post: Post = {
      id: store.newId(),
      topic: String(topic || "经验分享"),
      title: String(title).slice(0, 50),
      content: String(content).slice(0, 2000),
      author: String(author || "匿名星友").slice(0, 12),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    store.savePost(post);
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// 点赞 / 评论
export async function PATCH(req: NextRequest) {
  try {
    const { postId, action, author, content } = await req.json();
    const post = store.getPost(String(postId ?? ""));
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    if (action === "like") {
      post.likes += 1;
    } else if (action === "comment") {
      if (!content?.trim()) return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
      post.comments.push({
        id: store.newId(),
        author: String(author || "匿名星友").slice(0, 12),
        content: String(content).slice(0, 500),
        createdAt: new Date().toISOString(),
      });
    }
    store.savePost(post);
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
