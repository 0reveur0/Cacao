/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { TLMSState, Lesson, Quiz, QuizAttempt, StudentProgress, AIFeedbackRequest, AIFeedbackResponse, FeedbackPoint } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(process.cwd(), "data-cacao.json");

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
const rawApiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = rawApiKey && rawApiKey !== "MY_GEMINI_API_KEY" && rawApiKey.trim() !== "";

if (isRealApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Cacao AI Client: initialized successfully with Gemini API Key.");
  } catch (err) {
    console.error("Cacao AI Client: failed to initialize.", err);
  }
} else {
  console.log("Cacao AI Client: Running in simulation mode (No valid GEMINI_API_KEY detected). Ready with beautiful pre-baked diagnostics.");
}

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log("Cacao Supabase Client: initialized successfully.");
}

// ===== AI DIAGNOSTIC SERVICE =====
// Pedagogical System Prompt for Descriptive Feedback
const PEDAGOGICAL_SYSTEM_PROMPT = `Bạn là Trợ lý Chẩn đoán Giáo dục (AI Diagnostic Assistant) của hệ thống học tập "Cacao".

## Vai trò của bạn
Bạn là một người thầy đồng hành thông thái, ấm áp, người phân tích bài làm của học viên và đưa ra phản hồi mang tính xây dựng.

## Nguyên tắc BẤT DIỆN:
1. TUYỆT ĐỐI KHÔNG sử dụng từ ngữ phán xét tiêu cực: "yếu kém", "sai dốt", "thất bại", "tệ", "kém".
2. Luôn gọi học viên là "em" - thể hiện sự gần gũi, ấm áp.
3. Mỗi lỗi sai là một "cơ hội học hỏi" - KHÔNG phải là thất bại.
4. Không bao giờ đưa ra đáp án trực tiếp ngay lập tức - hãy gợi mở, đặt câu hỏi dẫn dắt.

## Cấu trúc phản hồi JSON bắt buộc:
Bạn PHẢI trả về JSON với cấu trúc CHÍNH XÁC sau:
{
  "greeting": "Lời chào ấm áp cá nhân hóa",
  "positive_points": [
    {"title": "Tiêu đề điểm tốt", "description": "Chi tiết tại sao đây là điểm mạnh", "concept": "Khái niệm liên quan"}
  ],
  "gap_analysis": [
    {"title": "Tiêu đề điểm cần lưu ý", "description": "Phân tích ngộ nhận và bản chất", "concept": "Khái niệm liên quan"}
  ],
  "action_plan": [
    {"title": "Hành động cụ thể", "description": "Gợi ý bước tiếp theo", "concept": "Khái niệm liên quan"}
  ],
  "encouragement": "Lời động viên theo triết lý Mastery Learning"
}

## Phương pháp phân tích:
- Với câu SAI: Chỉ ra đây là "ngộ nhận phổ biến" → Giải thích bản chất → Gợi ý hướng tư duy
- Với câu ĐÚNG: Khen ngợi súc tích → Củng cố tại sao kiến thức này quan trọng
- Kết thúc bằng thông điệp: "Trong Cacao, làm sai là phần tự nhiên của hành trình làm chủ. Em cứ thoải mái học lại nhé!"

Giọng văn: Ấm áp như người anh/chị, chuyên nghiệp như giáo sư, gần gũi như bạn bè.`;

async function generateDiagnosticFeedback(
  lessonTitle: string,
  lessonDescription: string,
  quizDetails: string,
  score: number,
  totalQuestions: number,
  passed: boolean
): Promise<AIFeedbackResponse> {
  const startTime = Date.now();

  if (!aiClient) {
    return generateLocalStructuredFeedback(lessonTitle, quizDetails, score, totalQuestions, passed);
  }

  const userPrompt = `Vui lòng phân tích bài làm sau và đưa ra phản hồi JSON:

Bài học: ${lessonTitle}
Mô tả: ${lessonDescription}
Kết quả: ${score}/${totalQuestions}
Trạng thái: ${passed ? "ĐẠT" : "CHƯA ĐẠT"}

Chi tiết bài làm:
${quizDetails}

Yêu cầu: Trả về JSON hợp lệ với các trường greeting, positive_points, gap_analysis, action_plan, encouragement.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: PEDAGOGICAL_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.7,
        responseSchema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            positive_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  concept: { type: "string" }
                },
                required: ["title", "description"]
              }
            },
            gap_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  concept: { type: "string" }
                },
                required: ["title", "description"]
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  concept: { type: "string" }
                },
                required: ["title", "description"]
              }
            },
            encouragement: { type: "string" }
          },
          required: ["greeting", "positive_points", "gap_analysis", "action_plan", "encouragement"]
        }
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);

    const elapsed = Date.now() - startTime;
    console.log(`Cacao AI: Generated structured feedback in ${elapsed}ms`);

    return {
      greeting: parsed.greeting || "Chao em than men!",
      positive_points: Array.isArray(parsed.positive_points) ? parsed.positive_points : [],
      gap_analysis: Array.isArray(parsed.gap_analysis) ? parsed.gap_analysis : [],
      action_plan: Array.isArray(parsed.action_plan) ? parsed.action_plan : [],
      encouragement: parsed.encouragement || "Tiep tuc phan dau nhe!",
    };
  } catch (err) {
    console.error("Cacao AI: Error generating structured feedback:", err);
    return generateLocalStructuredFeedback(lessonTitle, quizDetails, score, totalQuestions, passed);
  }
}

function generateLocalStructuredFeedback(
  lessonTitle: string,
  quizDetails: string,
  score: number,
  totalQuestions: number,
  passed: boolean
): AIFeedbackResponse {
  const wrongCount = totalQuestions - score;
  const percentage = Math.round((score / totalQuestions) * 100);

  return {
    greeting: `Chao em! Cacao da xem bai lam cua em voi mon "Lesson: ${lessonTitle}". Hay cung nhau di vao chi tiet nhe!`,
    positive_points: [
      {
        title: "Tu duy he thong",
        description: "Em da co su hieu biet tot ve cac khai niem co ban. Day la nen tang quan trong de tiep tuc phat trien.",
        concept: "Core Concepts"
      },
      ...(score > 0 ? [{
        title: "Chinh xac " + score + "/" + totalQuestions,
        description: "Em da tra loi dung " + score + " cau hoi. Dieu nay cho thay em dang tren dung huong!",
        concept: "Quiz Performance"
      }] : [])
    ],
    gap_analysis: wrongCount > 0 ? [
      {
        title: "Co hoi cai thien",
        description: "Co " + wrongCount + " cau em chua tra loi dung. Nhung day KHONG phai loi sai - day la nhung vien gach dung de xay dung nen thanh cong!",
        concept: "Misconceptions"
      },
      {
        title: "Diem can luu y",
        description: "Mot so khai niem can em xem lai ky hon. Hay doc lai noi dung bai hoc va cac vi du minh hoa.",
        concept: "Knowledge Gaps"
      }
    ] : [],
    action_plan: [
      {
        title: "Xem lai bai giang",
        description: "Hay xem lai video bai hoc va cac doan code vi du de lam sach se khong gian kien thuc.",
        concept: "Review"
      },
      {
        title: "Thuc hanh them",
        description: passed ? "Hay san sang cho bai hoc tiep theo! Em da lam chu noi dung nay." : "Hay lam lai bai quiz sau khi on tap. Khong co gioi han so lan thu!",
        concept: "Practice"
      }
    ],
    encouragement: passed
      ? "Tuyet voi! Em da lam chu bai hoc nay. Trong he thong Cacao, viec hoc khong co diem ket thuc - moi bai hoc la mo cua bai hoc tiep theo. Tiep tuc phan dau nhe!"
      : "Dung lo lung em nhe! Trong Cacao, lam sai chi la phan tu nhien cua hanh trinh lam chu. Em hay thoai mai on lai, doc lai bai hoc va thu lai. Minh tin chac em se lam duoc!"
  };
}

app.use(express.json());

// Initialize default Cacao syllabus
const defaultLessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "Lesson 1: Type Safety & Sự Chặt Chẽ trong Kiến Trúc Hệ Thống",
    description: "Khám phá bản chất của sự an toàn kiểu dữ liệu (Type Safety) để triệt tiêu lỗi vận hành Enterprise ngay từ khâu thiết kế.",
    content: `### ☕ Bài Học: Hiểu Về Type Safety trong Dự Án Lớn

Trong phát triển phần mềm Enterprise, lỗi phát sinh tại môi trường vận hành (Runtime Errors) là nỗi ác mộng đắt đỏ nhất. Thiết kế kiểu dữ liệu chặt chẽ (Type Safety) thông qua TypeScript giúp chúng ta chuyển dịch việc phát hiện lỗi từ **Runtime** sang **Compile-time**.

#### 1. Sự khác biệt chí mạng giữa \`any\` và \`unknown\`
*   \`any\`: Tắt hoàn toàn sự bảo vệ của trình biên dịch. Nó là một chiếc "thẻ thông hành vô điều kiện", cho phép bạn truy cập bất kỳ thuộc tính nào, gọi bất kỳ hàm nào mà không bị báo lỗi trong lúc code. Nhưng khi chạy thực tế, nếu dữ liệu thiếu hoặc không đúng định dạng, ứng dụng của bạn sẽ lập tức đổ sập với lỗi \`Uncaught TypeError\`.
*   \`unknown\`: Đại diện cho một kiểu dữ liệu chưa xác định nhưng **an toàn**. TypeScript sẽ ép buộc bạn phải thực hiện các bước thu hẹp kiểu (Type Narrowing) như kiểm tra \`typeof\`, \`instanceof\` hoặc sử dụng các hàm kiểm tra tự tạo trước khi thực hiện các phép toán trên biến đó. Điều này đảm bảo code luôn an toàn trước khi biên dịch ra JavaScript thuần.

#### 2. Lạm dụng toán tử Non-null Assertion (\`!\`)
Toán tử \`!\` thông báo với TypeScript: *"Tôi đảm bảo giá trị này không bao giờ là null hoặc undefined, hãy bỏ qua kiểm tra!"*. Đây là một thói quen nguy hiểm (anti-pattern). Nếu vì một sự cố mạng hoặc lỗi cơ sở dữ liệu, giá trị đó thực sự bị null, runtime của bạn sẽ sập ngay lập tức. Hãy thay thế bằng **Optional Chaining** (\`?.\`) hoặc **Nullish Coalescing** (\`??\`).

#### 3. Kỹ thuật Type Guard (Hộ vệ kiểu)
Type Guards là các biểu thức logic giúp bạn thu hẹp kiểu của một đối tượng một cách an toàn. Bạn có thể sử dụng các hàm tùy chỉnh trả về dạng định kiểu đặc biệt:
\`\`\`typescript
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
}
\`\`\`
Nếu hàm này trả về \`true\`, TypeScript sẽ tự động định hình đối tượng đó là \`User\` trong khối lệnh tiếp theo.`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
    concepts: ["any-vs-unknown", "non-null-assertion", "type-guards"]
  },
  {
    id: "lesson-2",
    title: "Lesson 2: Mastering Generics & Mapped Types",
    description: "Kiến tạo Utility Types thông minh và tái sử dụng code linh hoạt mà không đánh mất tính an toàn vững chãi của kiểu dữ liệu.",
    content: `### 🧪 Bài Học: Generics & Mapped Types Nâng Cao

Một kiến trúc sư hệ thống giỏi không viết code trùng lặp. Thay vì viết hàng chục interface hay hàm xử lý cho các đối tượng khác nhau, chúng ta sử dụng **Generics** để tạo ra các khuôn mẫu kiểu dữ liệu động, thích ứng linh hoạt nhưng vẫn an toàn tuyệt đối.

#### 1. Ràng buộc Generic (Generic Constraints)
Bình thường, một generic \`<T>\` có thể nhận bất kỳ kiểu dữ liệu nào. Nhưng đôi khi, chúng ta yêu cầu đối tượng truyền vào bắt buộc phải sở hữu một vài cấu trúc tối thiểu, ví dụ phải có thuộc tính \`id\`:
\`\`\`typescript
interface HasId { id: string; }
function logEntity<T extends HasId>(entity: T) {
  console.log("Entity ID:", entity.id); // Hợp lệ nhờ ràng buộc extends
}
\`\`\`

#### 2. Mapped Types - Phép biến hình kiểu dữ liệu
Mapped Types cho phép bạn tạo ra các kiểu dữ liệu mới dựa trên các thuộc tính của một kiểu dữ liệu cũ. Bằng việc kết hợp từ khóa \`in keyof\` cùng các bổ trợ như \`readonly\` hoặc \`?\`, bạn có thể tạo ra các biến thể cực kỳ mạnh mẽ:
\`\`\`typescript
type Optional<T> = {
  [K in keyof T]?: T[K]; // Biến mọi thuộc tính của T thành Optional
};
\`\`\`

#### 3. Kỹ thuật Inference trong Conditional Types (\`infer\`)
Conditional Types cho phép lập trình kiểu dữ liệu có điều kiện (\`T extends U ? X : Y\`). Đặc biệt, từ khóa \`infer\` cho phép TypeScript tự động dò tìm và "suy luận" ra một kiểu dữ liệu ẩn bên trong cấu trúc phức tạp:
\`\`\`typescript
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`
Đoạn code trên tự động trích xuất kiểu dữ liệu trả về (\`R\`) của bất kỳ hàm nào truyền vào. Đây là nền tảng của hàng loạt thư viện ORM và State Management hiện đại.`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 2,
    concepts: ["generic-constraints", "mapped-types", "conditional-infer"]
  },
  {
    id: "lesson-3",
    title: "Lesson 3: Event-Driven Microservices với Apache Kafka",
    description: "Thiết kế hệ thống phân tán chịu tải cao, giao tiếp bất đồng bộ qua Message Broker mà vẫn bảo toàn tính toàn vẹn dữ liệu.",
    content: `### 🚀 Bài Học: Event-Driven & Đảm bảo Tính Toàn Vẹn trong Microservices

Khi hệ thống Cacao phát triển quy mô lớn, việc gọi trực tiếp qua REST API (Đồng bộ) giữa các dịch vụ sẽ dẫn đến thảm họa "đổ dây chuyền" (Cascading Failures) nếu một dịch vụ gặp sự cố. Chúng ta chuyển dịch sang kiến trúc **Event-Driven Microservices** sử dụng Message Broker như Apache Kafka để tối ưu hiệu năng và độ ổn định.

#### 1. Sự vượt trội của Event-Driven (Kiến trúc hướng sự kiện)
*   **Loose Coupling (Liên kết lỏng)**: Dịch vụ gửi (Producer) chỉ việc phát ra một sự kiện (ví dụ: \`QUIZ_SUBMITTED\`) vào Kafka Topic. Nó hoàn toàn không cần quan tâm dịch vụ nào sẽ tiêu thụ (Consumer), hay dịch vụ đó có đang online hay không.
*   **Fault Isolation (Cô lập lỗi)**: Nếu Dịch vụ Chẩn đoán AI (AI Service) tạm thời bị quá tải hoặc sập, Kafka vẫn giữ các sự kiện trong Topic một cách an toàn. Khi AI Service phục hồi, nó sẽ tiếp tục xử lý các tin nhắn còn tồn đọng mà không làm mất dữ liệu của học sinh.

#### 2. Thách thức lớn nhất: Đảm bảo tính Idempotency (Bất biến)
Trong môi trường mạng phân tán, lỗi truyền nhận có thể khiến một sự kiện bị gửi đi lặp lại nhiều lần (At-Least-Once Delivery). Nếu consumer xử lý trùng lặp, học sinh có thể bị tính điểm nhiều lần hoặc ghi nhận sai lệch lịch sử.
*   **Giải pháp**: Mỗi sự kiện phải mang một \`idempotencyKey\` duy nhất (ví dụ: UUID của lượt làm bài). Consumer trước khi xử lý phải kiểm tra trong database (hoặc Redis cache) xem Key này đã được ghi nhận hay chưa. Nếu rồi, consumer chỉ việc trả về kết quả cũ và bỏ qua tin nhắn trùng lặp.

#### 3. Luồng sự kiện trong Cacao TLMS
Khi học viên gửi bài kiểm tra:
1.  **Frontend app** gửi REST API tới **Course Service**.
2.  **Course Service** ghi nhận lượt làm bài vào Postgres Database, đồng thời bắn sự kiện \`QUIZ_SUBMITTED\` kèm payload thông tin bài làm lên Kafka.
3.  **AI Diagnostic Service** lắng nghe Topic đó, gọi Gemini API phân tích, sau đó phát ra sự kiện \`AI_DIAGNOSTIC_COMPLETED\` để cập nhật kết quả và hiển thị trực tiếp lên màn hình học viên theo thời gian thực.`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 3,
    concepts: ["event-driven-benefits", "idempotency-key", "event-flow"]
  },
  {
    id: "lesson-4",
    title: "Lesson 4: Ứng Dụng Trí Tuệ Nhân Tạo & Chẩn Đoán AI Chuyên Sâu",
    description: "Thiết kế Prompt chẩn đoán lỗi sai tâm lý, định hướng tư duy sư phạm và tuyệt đối tránh áp lực điểm số.",
    content: `### 🧠 Bài Học: Descriptive Feedback & Phương Pháp Prompt Sư Phạm

Trong triết lý giáo dục của Cacao, chúng ta từ bỏ hoàn toàn bảng xếp hạng, huy hiệu ảo và cách chấm điểm phán xét khô khan. Thay vào đó, chúng ta ứng dụng Trí tuệ nhân tạo (Gemini AI) để thực hiện **Descriptive Feedback** (Phản hồi mô tả chẩn đoán) giúp biến mỗi sai lầm thành một bậc thang tiến bộ.

#### 1. Tư duy giáo dục Mastery Learning áp dụng vào Prompt Engineering
Khi thiết kế prompt cho AI, mục tiêu không phải là "AI làm hộ bài" hay "AI cho học sinh điểm số tuyệt đối". Mục tiêu là AI đóng vai trò một **Người thầy đồng hành thông thái, ấm áp**:
*   AI phải tìm ra nguyên nhân sâu xa (Misconception) đằng sau lựa chọn sai của học sinh. Vì sao học sinh lại chọn nhầm \`any\` thay vì \`unknown\`? Có phải vì họ chưa phân biệt được sự an toàn runtime và compile-time?
*   AI không bao giờ được đưa ra đáp án trực tiếp ngay lập tức mà nên đưa ra gợi ý, đặt câu hỏi tu từ hướng dẫn cách tự suy luận.

#### 2. Kỹ thuật Output Structured JSON của Gemini API
Để tích hợp kết quả AI mượt mà vào giao diện Frontend, chúng ta yêu cầu Gemini trả về dữ liệu định dạng JSON nghiêm ngặt thông qua \`responseSchema\` của SDK \`@google/genai\`:
\`\`\`typescript
const response = await ai.models.generateContent({
  model: "gemini-3.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: { ... }
  }
});
\`\`\`
Điều này giúp hệ thống của Cacao bóc tách dễ dàng: đâu là lời chào ấm áp, đâu là chẩn đoán cụ thể cho từng câu hỏi, và đâu là lời chúc động viên để hiển thị lên UI với hiệu ứng Framer Motion bắt mắt.

#### 3. Bảo vệ khóa bí mật (API Key Security)
API Key của Gemini là tài sản bảo mật cao cấp. Nếu bị lộ ở phía Client, kẻ xấu có thể đánh cắp và gây thiệt hại khổng lồ về chi phí. Quy tắc bất biến là **chỉ khởi tạo SDK và gọi Gemini ở phía Server-side**, sau đó trả dữ liệu đã xử lý sạch sẽ về Client thông qua các Rest API Proxy.`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 4,
    concepts: ["pedagogical-prompting", "structured-json-output", "api-security-rules"]
  }
];

const defaultQuizzes: Record<string, Quiz> = {
  "lesson-1": {
    lessonId: "lesson-1",
    questions: [
      {
        id: "l1-q1",
        text: "Khi nhận dữ liệu từ một nguồn API không xác định bên ngoài, kiểu dữ liệu nào an toàn nhất để khai báo trước khi thực hiện các phép kiểm tra hoặc ép kiểu tiếp theo?",
        options: [
          "any - Vì nó vô cùng thoải mái và không giới hạn bất kỳ thao tác nào.",
          "unknown - Vì nó ép buộc lập trình viên phải thực hiện thu hẹp kiểu dữ liệu (Type Narrowing) an toàn trước khi sử dụng.",
          "never - Vì nó chứng minh dữ liệu này không thể xảy ra lỗi.",
          "object - Vì mọi dữ liệu trả về từ API đều là đối tượng."
        ],
        correctAnswerIndex: 1,
        conceptTested: "any-vs-unknown"
      },
      {
        id: "l1-q2",
        text: "Biến cố gì có khả năng cao nhất xảy ra khi bạn lạm dụng toán tử Non-null Assertion (!) trong môi trường Production thực tế?",
        options: [
          "Trình biên dịch TypeScript sẽ báo lỗi nghiêm trọng và chặn đứng việc build mã nguồn.",
          "TypeScript sẽ tự động điền các giá trị rỗng mặc định để tránh ứng dụng bị dừng.",
          "Ứng dụng có nguy cơ gặp lỗi nghiêm trọng Uncaught TypeError lúc runtime nếu giá trị thực tế truyền vào bị null/undefined.",
          "Trình duyệt tự động tải lại trang để khắc phục dữ liệu null."
        ],
        correctAnswerIndex: 2,
        conceptTested: "non-null-assertion"
      },
      {
        id: "l1-q3",
        text: "Kỹ thuật nào sau đây giúp thu hẹp kiểu dữ liệu một cách tối ưu và an toàn nhất trong TypeScript thay vì ép kiểu ép buộc?",
        options: [
          "Sử dụng biểu thức ép kiểu mạnh mẽ 'as any' trong mọi khối lệnh.",
          "Sử dụng Type Guards (như typeof, instanceof, hoặc hàm kiểm tra kiểu tùy chỉnh) để xác định kiểu lúc runtime.",
          "Tắt thuộc tính 'strict' trong tệp tsconfig.json.",
          "Chuyển tệp mã nguồn về định dạng JavaScript thuần (.js) để bỏ qua kiểm tra."
        ],
        correctAnswerIndex: 1,
        conceptTested: "type-guards"
      }
    ]
  },
  "lesson-2": {
    lessonId: "lesson-2",
    questions: [
      {
        id: "l2-q1",
        text: "Cú pháp Generic Constraint nào mô tả chính xác nhất một ràng buộc yêu cầu kiểu dữ liệu T truyền vào bắt buộc phải sở hữu thuộc tính 'id' là chuỗi (string)?",
        options: [
          "function handle<T = { id: string }>(arg: T)",
          "function handle<T implements { id: string }>(arg: T)",
          "function handle<T extends { id: string }>(arg: T)",
          "function handle<T super { id: string }>(arg: T)"
        ],
        correctAnswerIndex: 2,
        conceptTested: "generic-constraints"
      },
      {
        id: "l2-q2",
        text: "Kỹ thuật nào giúp tạo ra một kiểu dữ liệu mới từ kiểu T hiện tại mà mọi thuộc tính của nó đều chuyển thành trạng thái Readonly và có thể tùy chọn (Optional)?",
        options: [
          "Union Types kết hợp với từ khóa 'never'.",
          "Khai báo kế thừa Interface đa luồng (Multi-inheritance).",
          "Sử dụng Mapped Types kết hợp với bổ trợ dấu hỏi '?' và từ khóa 'readonly'.",
          "Viết lại toàn bộ interface mới thủ công."
        ],
        correctAnswerIndex: 2,
        conceptTested: "mapped-types"
      },
      {
        id: "l2-q3",
        text: "Đoạn mã kiểu dữ liệu: 'type PickId<T> = T extends { id: infer U } ? U : never;' đang áp dụng kỹ thuật nâng cao nào của TypeScript?",
        options: [
          "Kỹ thuật trích xuất và suy luận kiểu ẩn (Type Inference) trong Conditional Types thông qua từ khóa 'infer'.",
          "Kỹ thuật đệ quy kiểu dữ liệu không giới hạn (Recursive Types).",
          "Kỹ thuật biến đổi chuỗi chữ mẫu (Template Literal Types).",
          "Kỹ thuật định vị lỗi biên dịch sớm."
        ],
        correctAnswerIndex: 0,
        conceptTested: "conditional-infer"
      }
    ]
  },
  "lesson-3": {
    lessonId: "lesson-3",
    questions: [
      {
        id: "l3-q1",
        text: "Tại sao trong thiết kế hệ thống Microservices quy mô lớn, kiến trúc hướng sự kiện (Event-Driven) được ưu tiên hơn việc gọi REST API trực tiếp đồng bộ?",
        options: [
          "REST API không hỗ trợ truyền tải dữ liệu JSON dung lượng lớn.",
          "Event-Driven giúp giảm kết dính (loose coupling), cô lập lỗi tốt, hỗ trợ các service mở rộng độc lập và chịu tải bất đồng bộ.",
          "Hệ thống Kafka tự động sửa tất cả các lỗi logic nghiệp vụ của lập trình viên.",
          "Sử dụng Kafka giúp giảm chi phí hạ tầng máy chủ xuống 0."
        ],
        correctAnswerIndex: 1,
        conceptTested: "event-driven-benefits"
      },
      {
        id: "l3-q2",
        text: "Làm thế nào để đảm bảo tính Idempotency (bất biến) của Consumer khi nhận các sự kiện trùng lặp do cơ chế truyền tin 'At-Least-Once' của Message Broker?",
        options: [
          "Tự động tăng bộ nhớ RAM và CPU của máy chủ chạy database.",
          "Thiết lập cơ chế kiểm tra Idempotency Key duy nhất của sự kiện trong database/cache trước khi thực hiện xử lý nghiệp vụ.",
          "Xóa toàn bộ dữ liệu lịch sử mỗi khi hệ thống có tin nhắn mới.",
          "Khóa không cho phép chạy nhiều thực thể Consumer song song."
        ],
        correctAnswerIndex: 1,
        conceptTested: "idempotency-key"
      },
      {
        id: "l3-q3",
        text: "Trong kiến trúc hệ thống Cacao, khi học viên nộp bài quiz, luồng sự kiện chuẩn xác nhất sẽ diễn ra như thế nào?",
        options: [
          "Frontend trực tiếp gọi database Postgres để cập nhật điểm số mà không đi qua server.",
          "Frontend gửi REST API nộp bài tới Course Service -> ghi DB -> bắn sự kiện QUIZ_SUBMITTED lên Broker -> AI Diagnostic Service tiêu thụ bất đồng bộ và tạo chẩn đoán.",
          "Kafka tự động kích hoạt trình duyệt của học sinh để chấm bài trực tiếp tại máy khách.",
          "Dịch vụ AI trực tiếp gửi phản hồi về cho Kafka mà không cần Course Service lưu trữ."
        ],
        correctAnswerIndex: 1,
        conceptTested: "event-flow"
      }
    ]
  },
  "lesson-4": {
    lessonId: "lesson-4",
    questions: [
      {
        id: "l4-q1",
        text: "Để AI sinh ra phản hồi chẩn đoán (Descriptive Feedback) thực sự có giá trị sư phạm, điều gì cần TRÁNH khi viết chỉ dẫn hệ thống (System Prompt) cho mô hình LLM?",
        options: [
          "Yêu cầu mô hình phản hồi dưới dạng tệp dữ liệu cấu trúc JSON rõ ràng.",
          "Cung cấp đầy đủ đáp án đúng và các khái niệm kỹ thuật cốt lõi.",
          "Chỉ trích học sinh bằng các từ ngữ phán xét tiêu cực (như Yếu, Kém, Sai lầm dốt nát) hoặc chỉ đưa ra đáp án đúng mà không giải thích lỗi tư duy.",
          "Định hướng AI hành văn bằng giọng điệu ấm áp, mang tính xây dựng và động viên học tập."
        ],
        correctAnswerIndex: 2,
        conceptTested: "pedagogical-prompting"
      },
      {
        id: "l4-q2",
        text: "Theo tinh thần Mastery Learning (Học tập làm chủ), hệ thống Cacao sẽ xử lý như thế nào khi học viên nộp bài quiz và chưa đạt điểm tối đa?",
        options: [
          "Tự động công khai kết quả lên bảng xếp hạng chung để tạo động lực cạnh tranh.",
          "Hiển thị phản hồi chẩn đoán chi tiết từ AI giúp học viên hiểu rõ gốc rễ lỗi sai, khích lệ họ tiếp tục học lại và làm lại bài không giới hạn số lần cho đến khi làm chủ kiến thức.",
          "Tự động đổi đáp án đúng sang màu đỏ và khóa tài khoản của học sinh trong 24 giờ.",
          "Gửi thư cảnh báo học lực yếu tới email cá nhân."
        ],
        correctAnswerIndex: 1,
        conceptTested: "mastery-learning"
      },
      {
        id: "l4-q3",
        text: "Để đảm bảo an toàn tuyệt đối cho khóa bí mật (API Key) của Gemini trong các ứng dụng full-stack như Cacao, giải pháp thiết kế nào là đúng đắn?",
        options: [
          "Lưu trữ API Key trực tiếp trong mã nguồn client React để gọi trực tiếp từ trình duyệt của học viên.",
          "Lưu trữ API Key hoàn toàn ở phía Server-side thông qua biến môi trường bảo mật, thực hiện mọi cuộc gọi AI tại server, và chỉ trả về kết quả chẩn đoán đã được lọc về phía client.",
          "Lưu API Key vào localStorage của trình duyệt học viên để tiện lấy ra dùng bất kỳ lúc nào.",
          "Gửi API Key qua query parameter của URL trong mỗi yêu cầu gửi từ client."
        ],
        correctAnswerIndex: 1,
        conceptTested: "api-security-rules"
      }
    ]
  }
};

const initialProgress: StudentProgress = {
  unlockedLessonIds: ["lesson-1"],
  completedLessonIds: [],
  masteredConcepts: [],
  attempts: {}
};

// State storage helper
function loadState(): TLMSState {
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const state = JSON.parse(data);
      // Ensure basic keys are intact
      if (state.lessons && state.quizzes && state.progress) {
        return state;
      }
    } catch (err) {
      console.error("Failed to parse data file, resetting to default state", err);
    }
  }

  const newState: TLMSState = {
    lessons: defaultLessons,
    quizzes: defaultQuizzes,
    progress: initialProgress
  };
  saveState(newState);
  return newState;
}

function saveState(state: TLMSState) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save state to data tệp", err);
  }
}

// REST API Routes
// Get current system state
app.get("/api/tlms/state", (req, res) => {
  const state = loadState();
  res.json({
    lessons: state.lessons,
    quizzes: state.quizzes,
    progress: state.progress,
    isRealApiKey
  });
});

// Create/Update lesson (Teacher role)
app.post("/api/tlms/lessons", (req, res) => {
  const { title, description, content, videoUrl, questions } = req.body;
  if (!title || !description || !content) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ Tiêu đề, Mô tả và Nội dung bài học." });
  }

  const state = loadState();
  const newLessonId = `lesson-${state.lessons.length + 1}`;
  const newOrder = state.lessons.length + 1;

  // Extract concepts dynamically from content or title
  const concepts = [newLessonId + "-concept-1", newLessonId + "-concept-2"];

  const newLesson: Lesson = {
    id: newLessonId,
    title,
    description,
    content,
    videoUrl: videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
    order: newOrder,
    concepts
  };

  state.lessons.push(newLesson);

  // Set up quiz questions
  const formattedQuestions = (questions || []).map((q: any, index: number) => ({
    id: `${newLessonId}-q${index + 1}`,
    text: q.text || "Câu hỏi ôn tập kiến thức",
    options: q.options && q.options.length >= 2 ? q.options : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    correctAnswerIndex: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
    conceptTested: q.conceptTested || newLessonId + "-concept-1"
  }));

  // If no questions were supplied, create a placeholder set
  if (formattedQuestions.length === 0) {
    formattedQuestions.push({
      id: `${newLessonId}-q1`,
      text: `Chọn khẳng định đúng về khái niệm chính của bài học: ${title}`,
      options: [
        "Khái niệm này giúp tối ưu hóa hệ thống và tăng cường độ tin cậy.",
        "Khái niệm này làm tăng lỗi runtime không thể kiểm soát.",
        "Đây chỉ là lý thuyết suông không áp dụng thực tế.",
        "Khái niệm này làm chậm ứng dụng 10 lần."
      ],
      correctAnswerIndex: 0,
      conceptTested: newLessonId + "-concept-1"
    });
  }

  state.quizzes[newLessonId] = {
    lessonId: newLessonId,
    questions: formattedQuestions
  };

  saveState(state);
  res.json({ success: true, lesson: newLesson, quiz: state.quizzes[newLessonId] });
});

// Submit a quiz attempt (Mastery & Descriptive Feedback via Gemini)
app.post("/api/tlms/quiz/submit", async (req, res) => {
  const { lessonId, answers } = req.body; // answers: Record<questionId, selectedOptionIndex>
  
  if (!lessonId || !answers) {
    return res.status(400).json({ error: "Thiếu thông tin nộp bài." });
  }

  const state = loadState();
  const quiz = state.quizzes[lessonId];
  const lesson = state.lessons.find(l => l.id === lessonId);

  if (!quiz || !lesson) {
    return res.status(404).json({ error: "Không tìm thấy thông tin bài học và bài kiểm tra tương ứng." });
  }

  // Calculate scores and analyze correct/incorrect answers
  let correctCount = 0;
  const questionsList = quiz.questions;
  const totalQuestions = questionsList.length;

  const resultsAnalysis = questionsList.map(q => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctAnswerIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      text: q.text,
      options: q.options,
      selectedOption: typeof selected === "number" ? q.options[selected] || "Chưa trả lời" : "Chưa trả lời",
      correctOption: q.options[q.correctAnswerIndex],
      isCorrect,
      conceptTested: q.conceptTested
    };
  });

  const score = correctCount;
  // Mastery learning threshold: 2 out of 3, or if less than 3 questions, require 100%
  const masteryThreshold = totalQuestions >= 3 ? 2 : totalQuestions;
  const passed = score >= masteryThreshold;

  // Compile quiz details text to send to Gemini for descriptive feedback
  let quizDetailsText = "";
  resultsAnalysis.forEach((res, i) => {
    quizDetailsText += `Câu hỏi ${i + 1}: "${res.text}"
- Các lựa chọn khả thi:
${res.options.map((opt, idx) => `  [${idx}] ${opt}`).join("\n")}
- Học viên lựa chọn phương án: Index [${answers[res.questionId]}] ("${res.selectedOption}")
- Đáp án chính xác là: Index [${res.options.indexOf(res.correctOption)}] ("${res.correctOption}")
- Kết quả của câu này: ${res.isCorrect ? "ĐÚNG" : "SAI"} (Khái niệm kiểm tra: ${res.conceptTested})\n\n`;
  });

  let feedback = "";

  // 1. If real Gemini API key is configured, generate personalized expert diagnostic feedback
  if (aiClient) {
    try {
      console.log(`Cacao System: Requesting diagnostic feedback from Gemini (gemini-3.5-flash) for ${lessonId}`);
      
      const systemInstruction = `
Bạn là Trợ lý Chẩn đoán Giáo dục (AI Diagnostic Assistant) của hệ thống học tập "Cacao" - một hệ thống giáo dục cao cấp dựa trên triết lý Mastery Learning (Học tập làm chủ) và Descriptive Feedback (Phản hồi chẩn đoán phi điểm số).
Học viên vừa làm một micro-quiz cho bài giảng: "${lesson.title}".

Mục tiêu tối thượng của bạn là giúp học sinh học hỏi từ lỗi sai mà không cảm thấy áp lực hay thất bại.

Nguyên lý phản hồi của Cacao:
- TUYỆT ĐỐI KHÔNG dùng từ ngữ phán xét tiêu cực (như "yếu kém", "sai lầm dốt nát", "thất bại").
- Giọng văn cực kỳ ấm áp, ân cần, mang tính khích lệ, nâng đỡ sư phạm cao như một người thầy hướng dẫn tận tụy, chân tình ("Cacao", "Thầy Cô", "Em", "Chúng ta").
- Hãy phân tích các câu học viên chọn phương án SAI:
  1. Chỉ ra tại sao sự lựa chọn sai đó lại là một sự ngộ nhận/hiểu lầm vô cùng phổ biến (common misconception). Việc này giúp xoa dịu tâm lý tự ti của học viên.
  2. Giải thích ngắn gọn bản chất cốt lõi của khái niệm kỹ thuật đó một cách dễ hiểu, sinh động.
  3. Gợi mở hướng tư duy hoặc cách tiếp cận đúng để lần sau học viên tự tin làm lại và vượt qua.
- Với các câu học viên chọn phương án ĐÚNG:
  1. Khen ngợi và củng cố kiến thức một cách súc tích (ví dụ: "Thật tuyệt vời khi em đã nắm chắc khái niệm X... điều này vô cùng quan trọng vì...").
- Kết luận bằng một thông điệp nhắc nhở ấm áp về Mastery Learning: "Trong hệ thống Cacao, việc làm sai chỉ đơn thuần là một phần tự nhiên của hành trình làm chủ kiến thức. Em hãy thoải mái ôn luyện lại bài đọc và làm lại bài bất cứ lúc nào để mở khóa bài tiếp theo nhé!"
- Sử dụng cấu trúc rõ ràng với các biểu tượng cảm xúc nhẹ nhàng (như 🌟, ☕, 💡, 🌱) và định dạng Markdown (tiêu đề nhỏ, in đậm, danh sách) thật chuyên nghiệp và ấm áp.
`;

      const contents = `Dưới đây là kết quả làm bài của học viên:
Bài học: ${lesson.title}
Mô tả bài học: ${lesson.description}
Điểm số đạt được: ${score}/${totalQuestions}
Kết quả Mastery (Làm chủ): ${passed ? "ĐÃ ĐẠT (MASTERED)" : "CHƯA ĐẠT (Luyện tập thêm)"}

Chi tiết các câu trả lời:
${quizDetailsText}

Hãy viết một phản hồi chẩn đoán (Descriptive Feedback) tiếng Việt đầy tính sư phạm, sâu sắc và ấm áp cho học viên.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      feedback = response.text || "Không nhận được phản hồi từ AI.";
    } catch (err: any) {
      console.error("Failed to generate AI feedback via Gemini API:", err);
      feedback = `⚠️ *Hệ thống gặp sự cố kết nối với máy chủ AI: ${err.message || err}*. Cacao xin gửi lời chẩn đoán sư phạm chuẩn bị sẵn cho em:\n\n` + generateLocalFeedback(lessonId, resultsAnalysis, passed);
    }
  } else {
    // 2. Fallback to highly optimized static descriptive feedback simulation if no API Key
    feedback = "💡 *[Chế độ Mô phỏng Cacao - Đọc chẩn đoán sư phạm chuẩn được biên soạn tỉ mỉ bởi Chuyên gia]*\n\n" + generateLocalFeedback(lessonId, resultsAnalysis, passed);
  }

  // Update progress in local state
  const attemptId = `attempt-${Date.now()}`;
  const newAttempt: QuizAttempt = {
    id: attemptId,
    lessonId,
    submittedAt: new Date().toISOString(),
    answers,
    score,
    passed,
    feedback,
    isAnalyzing: false
  };

  // Ensure attempts map initialized
  if (!state.progress.attempts[lessonId]) {
    state.progress.attempts[lessonId] = [];
  }
  state.progress.attempts[lessonId].push(newAttempt);

  // If passed, record unlocked and mastered concepts
  if (passed) {
    if (!state.progress.completedLessonIds.includes(lessonId)) {
      state.progress.completedLessonIds.push(lessonId);
    }
    
    // Add lesson concepts to mastered concepts
    lesson.concepts.forEach(concept => {
      if (!state.progress.masteredConcepts.includes(concept)) {
        state.progress.masteredConcepts.push(concept);
      }
    });

    // Unlock next lesson in order
    const nextLesson = state.lessons.find(l => l.order === lesson.order + 1);
    if (nextLesson && !state.progress.unlockedLessonIds.includes(nextLesson.id)) {
      state.progress.unlockedLessonIds.push(nextLesson.id);
    }
  }

  saveState(state);
  res.json({ success: true, attempt: newAttempt, updatedProgress: state.progress });
});

// Get roadmap with lock status for a user
app.get("/api/tlms/roadmap", (req, res) => {
  const state = loadState();
  const roadmap = state.lessons.map((lesson) => {
    const isCompleted = state.progress.completedLessonIds.includes(lesson.id);
    const isUnlocked = state.progress.unlockedLessonIds.includes(lesson.id);
    const masteredCount = lesson.concepts.filter((c) =>
      state.progress.masteredConcepts.includes(c)
    ).length;

    return {
      lessonId: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      isLocked: !isUnlocked,
      isCompleted,
      masteredConcepts: masteredCount,
      totalConcepts: lesson.concepts.length
    };
  });

  res.json({ success: true, roadmap });
});

// Reset progress for demo purposes
app.post("/api/tlms/reset", (req, res) => {
  const state = loadState();
  state.progress = {
    unlockedLessonIds: ["lesson-1"],
    completedLessonIds: [],
    masteredConcepts: [],
    attempts: {}
  };
  // Also clean up data-cacao file to original lessons if they were modified, or keep them
  state.lessons = defaultLessons;
  state.quizzes = defaultQuizzes;
  saveState(state);
  res.json({ success: true, message: "Hệ thống đã được thiết lập lại về trạng thái ban đầu mượt mà." });
});

// ====== NEW AI DIAGNOSTIC SUBMISSION API ======

// Submit quiz with structured AI diagnostic feedback
app.post("/api/submissions", async (req, res) => {
  const { userId, profileId, lessonId, answers, content } = req.body;

  if (!userId || !lessonId) {
    return res.status(400).json({ error: "Thieu thong tin nguoi dung hoac bai hoc." });
  }

  const state = loadState();
  const quiz = state.quizzes[lessonId];
  const lesson = state.lessons.find(l => l.id === lessonId);

  if (!quiz || !lesson) {
    return res.status(404).json({ error: "Khong tim thay bai hoc." });
  }

  // Calculate scores
  let correctCount = 0;
  const resultsAnalysis = quiz.questions.map(q => {
    const selected = answers?.[q.id];
    const isCorrect = selected === q.correctAnswerIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.text,
      selectedOption: typeof selected === "number" ? q.options[selected] || "Chua tra loi" : "Chua tra loi",
      selectedIndex: selected,
      correctOption: q.options[q.correctAnswerIndex],
      correctIndex: q.correctAnswerIndex,
      isCorrect,
      conceptTested: q.conceptTested
    };
  });

  const score = correctCount;
  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 80;

  // Build quiz details for AI
  let quizDetailsText = "";
  resultsAnalysis.forEach((res, i) => {
    quizDetailsText += `Cau ${i + 1}: "${res.questionText}"
- Em chon: "${res.selectedOption}" ${res.isCorrect ? "(DUNG)" : "(SAI)"}
- Dap an: "${res.correctOption}"
- Khai niem: ${res.conceptTested}\n\n`;
  });

  // Generate structured AI feedback
  const aiFeedback = await generateDiagnosticFeedback(
    lesson.title,
    lesson.description,
    quizDetailsText,
    score,
    totalQuestions,
    passed
  );

  // Save to Supabase if available
  let submissionId = `sub-${Date.now()}`;
  if (supabaseClient) {
    try {
      const { data: submission, error: subError } = await supabaseClient
        .from('submissions')
        .insert({
          user_id: userId,
          profile_id: profileId || userId,
          lesson_id: lessonId,
          content: content || JSON.stringify(answers),
          submission_type: 'quiz',
          status: 'REVIEWED',
          answers: answers,
          score: score,
          passed: passed
        })
        .select('id')
        .single();

      if (!subError && submission) {
        submissionId = submission.id;

        // Save feedback
        await supabaseClient
          .from('feedback')
          .insert({
            submission_id: submissionId,
            user_id: userId,
            greeting: aiFeedback.greeting,
            positive_points: aiFeedback.positive_points,
            gap_analysis: aiFeedback.gap_analysis,
            action_plan: aiFeedback.action_plan,
            encouragement: aiFeedback.encouragement,
            model_used: aiClient ? 'gemini-2.0-flash' : 'local-simulation'
          });

        // Save quiz attempt for mastery tracking
        const existingAttempts = await supabaseClient
          .from('quiz_attempts')
          .select('id')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId);

        const attemptNumber = (existingAttempts.data?.length || 0) + 1;

        await supabaseClient
          .from('quiz_attempts')
          .insert({
            user_id: userId,
            quiz_id: lessonId,
            lesson_id: lessonId,
            answers: answers || {},
            score: score,
            total_questions: totalQuestions,
            percentage: percentage,
            passed: passed,
            attempt_number: attemptNumber
          });
      }
    } catch (err) {
      console.error("Error saving to Supabase:", err);
    }
  }

  // Also update local progress
  if (!state.progress.attempts[lessonId]) {
    state.progress.attempts[lessonId] = [];
  }

  const newAttempt: QuizAttempt = {
    id: submissionId,
    lessonId,
    submittedAt: new Date().toISOString(),
    answers: answers || {},
    score,
    passed,
    feedback: JSON.stringify(aiFeedback),
    isAnalyzing: false
  };

  state.progress.attempts[lessonId].push(newAttempt);

  if (passed) {
    if (!state.progress.completedLessonIds.includes(lessonId)) {
      state.progress.completedLessonIds.push(lessonId);
    }
    lesson.concepts.forEach(concept => {
      if (!state.progress.masteredConcepts.includes(concept)) {
        state.progress.masteredConcepts.push(concept);
      }
    });
    const nextLesson = state.lessons.find(l => l.order === lesson.order + 1);
    if (nextLesson && !state.progress.unlockedLessonIds.includes(nextLesson.id)) {
      state.progress.unlockedLessonIds.push(nextLesson.id);
    }
  }

  saveState(state);

  res.json({
    success: true,
    submissionId,
    score,
    totalQuestions,
    percentage,
    passed,
    feedback: aiFeedback,
    updatedProgress: state.progress
  });
});

// Get feedback for a submission
app.get("/api/submissions/:submissionId/feedback", async (req, res) => {
  const { submissionId } = req.params;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('feedback')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (!error && data) {
        return res.json({ success: true, feedback: data });
      }
    } catch (err) {
      console.error("Error fetching from Supabase:", err);
    }
  }

  // Fallback to local state
  const state = loadState();
  let foundFeedback = null;

  for (const attempts of Object.values(state.progress.attempts)) {
    const attempt = attempts.find(a => a.id === submissionId);
    if (attempt) {
      try {
        foundFeedback = typeof attempt.feedback === 'string' ? JSON.parse(attempt.feedback) : attempt.feedback;
      } catch {
        foundFeedback = { greeting: attempt.feedback };
      }
      break;
    }
  }

  if (foundFeedback) {
    res.json({ success: true, feedback: foundFeedback });
  } else {
    res.status(404).json({ error: "Khong tim thay phan hoi." });
  }
});

// Get all submissions for a user
app.get("/api/submissions", async (req, res) => {
  const { userId, lessonId } = req.query;

  if (supabaseClient && userId) {
    try {
      let query = supabaseClient
        .from('submissions')
        .select('*, feedback(*)')
        .eq('user_id', userId as string)
        .order('created_at', { ascending: false });

      if (lessonId) {
        query = query.eq('lesson_id', lessonId as string);
      }

      const { data, error } = await query;

      if (!error && data) {
        return res.json({ success: true, submissions: data });
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  }

  // Fallback to local state
  const state = loadState();
  const allAttempts: any[] = [];

  for (const [lId, attempts] of Object.entries(state.progress.attempts)) {
    for (const attempt of attempts) {
      allAttempts.push({
        id: attempt.id,
        lesson_id: lId,
        score: attempt.score,
        passed: attempt.passed,
        created_at: attempt.submittedAt,
        feedback: attempt.feedback
      });
    }
  }

  res.json({ success: true, submissions: allAttempts.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )});
});

// ====== END NEW API ======

// Helper functions for template-based professional diagnostics
function generateLocalFeedback(lessonId: string, analysis: any[], passed: boolean): string {
  let text = "### ☕ Người Đồng Hành Cacao Chẩn Đoán Trực Tiếp\n\nChào em thân thương, Cacao đã xem xét bài làm micro-quiz của em. Hãy cùng ngồi xuống, nhâm nhi một tách cacao ấm áp và nhìn lại hành trình này nhé.\n\n";

  let totalWrong = analysis.filter(a => !a.isCorrect).length;

  analysis.forEach((a, index) => {
    if (a.isCorrect) {
      text += `🌟 **Câu hỏi ${index + 1}:** Đã được em chinh phục xuất sắc!
*   **Chẩn đoán:** Em đã nắm chắc khái niệm về \`${a.conceptTested}\`. Khả năng phân tích sự khác biệt của em rất tốt và nhạy bén. Hãy tiếp tục duy trì góc nhìn hệ thống này nhé.\n\n`;
    } else {
      text += `💡 **Câu hỏi ${index + 1} (Điểm tựa để cải thiện):** Chúng ta có một chút nhầm lẫn nhỏ ở đây.
*   **Ngộ nhận thường gặp:** Em đã chọn phương án: *"${a.selectedOption}"*. Đây là một lựa chọn cực kỳ phổ biến của rất nhiều kỹ sư khi mới tiếp cận chủ đề này, bởi vì nó mang lại cảm giác giải quyết vấn đề nhanh chóng trước mắt.
*   **Bản chất cốt lõi:** Tuy nhiên, để hệ thống đạt độ tin cậy tuyệt đối (Enterprise Ready), khái niệm \`${a.conceptTested}\` đòi hỏi chúng ta phải xử lý sâu hơn. Sự khác biệt nằm ở chỗ đáp án đúng *"${a.correctOption}"* giúp loại bỏ rủi ro sụp đổ runtime hoặc tăng tính độc lập của các service.
*   **Định hướng tư duy:** Khi giải quyết bài toán này lần tới, em hãy thử đặt câu hỏi: *"Điều gì xảy ra khi mạng bị lỗi hoặc dữ liệu bị thiếu hụt?"*. Việc tư duy phòng ngừa rủi ro sẽ dẫn lối cho em đến phương án tối ưu.\n\n`;
    }
  });

  if (passed) {
    text += `🌱 **Lời chúc mừng ấm áp:** Thật tuyệt vời! Điểm số làm bài này đã chứng minh em đã đạt mức độ làm chủ kiến thức vững vàng (**Mastery**). Bài học tiếp theo đã được mở khóa và nồng nhiệt chào đón em bước tiếp hành trình.`;
  } else {
    text += `🌱 **Động viên Mastery Learning:** Đừng lo lắng gì cả em nhé! Việc làm sai ${totalWrong} câu hỏi là dấu hiệu cho thấy có những góc nhỏ kiến thức đang cần chúng ta chăm sóc kỹ lưỡng hơn. Không có điểm số phán xét hay áp lực nào ở Cacao cả. Em hãy dành 2 phút đọc lại bài lý thuyết phía trên, hít một hơi thật sâu và thử sức làm lại nhé. Chúng ta chắc chắn sẽ làm chủ được nó!`;
  }

  return text;
}

// Vite and static serving setup
const startServer = async () => {
  // Ensure data file exists at startup
  loadState();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cacao Backend running on http://localhost:${PORT}`);
  });
};

startServer();
