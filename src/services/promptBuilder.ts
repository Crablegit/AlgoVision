import { CustomTestContext, ViewType } from '../types';

export function buildProblemAnalysisPrompt(
  problemText: string,
  userSampleInput: string,
  userSampleOutput: string
): string {
  const hasUserSample = (userSampleInput && userSampleInput.trim() !== '') || (userSampleOutput && userSampleOutput.trim() !== '');

  const sampleInstruction = hasUserSample ? `
ƯU TIÊN TUYỆT ĐỐI THEO BỘ TEST MẪU NGƯỜI DÙNG CUNG CẤP:
- Input mẫu:
${userSampleInput || '(chưa nhập - lấy từ đề)'}
- Output mẫu:
${userSampleOutput || '(chưa nhập - lấy từ đề)'}
` : '';

  return `
Bạn là Trợ lý Trực quan hóa Đề bài Lập trình Thi đấu (Competitive Programming Semantic Visualizer).

MỤC TIÊU CỐT LÕI CỦA BẠN:
Minh họa NGỮ CẢNH VÀ QUY TẮC HOẠT ĐỘNG CỦA ĐỀ BÀI (Semantic Problem Model), giúp người dùng hiểu:
1. Input của test đang mô tả những THỰC THỂ (entities) nào trong đề bài (thành phố, ô lưới, quân cờ, thùng nước, đoạn thẳng, xâu ký tự...).
2. TRẠNG THÁI BAN ĐẦU của các thực thể khi mới nhận input.
3. TỪNG BƯỚC THỰC THI / SỰ KIỆN: mỗi lệnh, truy vấn, giây thời gian, thao tác chuyển đổi làm thay đổi trạng thái của các thực thể như thế nào.
4. KẾT QUẢ ĐẦU RA: Kết quả (Output) được hình thành như thế nào từ trạng thái cuối cùng của các thực thể.

QUY TẮC ĐẶC BIỆT QUAN TRỌNG:
1. TUYỆT ĐỐI KHÔNG ÉP THUẬT TOÁN GIẢI BÊN TRONG CỦA THUẬT TOÁN (NO FORCED SOLVER SIMULATION):
   - Đừng ép thuật toán Two Pointers (L/R pointers), Dijkstra, Binary Search, DP Table vào mô phỏng NẾU ĐỀ BÀI KHÔNG MÔ TẢ HAI CON TRỎ / HÀNG ĐỢI ƯU TIÊN.
   - CHỈ mô phỏng đúng các thao tác ngữ nghĩa mà đề bài yêu cầu.
2. OUTPUT KHÔNG PHẢI LÀ SỐ BƯỚC (OUTPUT IS NOT A STEP COUNT):
   - Nếu output là 7 (ví dụ: tổng lớn nhất = 7, số cách = 7, khoảng cách = 7), TUYỆT ĐỐI KHÔNG sinh 7 frames 0..7 một cách vô nghĩa! Chỉ sinh các bước theo đúng diễn biến của đề bài.
3. BỘ TEST ĐA TRUY VẤN (T >= 2):
   - Nếu input có nhiều test case (T >= 2) hoặc nhiều truy vấn, BẮT BUỘC mô phỏng LẦN LƯỢT TẤT CẢ các test case / truy vấn trong chuỗi frames, không dừng lại ở test 1!
4. CON TRỎ (POINTERS):
   - CHỈ đưa con trỏ vào mảng / chuỗi khi đề bài thực sự có thao tác con trỏ. Nếu không dùng con trỏ, để "pointers": {}.
5. BÀI TOÁN CẮT BÁNH / HÌNH HỘP CHỮ NHẬT 2D (CAKE CUTTING / 2D BOX PARTITION):
   - Khi đề bài mô tả chiếc bánh hình chữ nhật (0,0) đến (w,h) hoặc việc cắt/chia các vùng hình chữ nhật 2D (như Cake Cutting):
     + Chọn viewType = "geometry", subType = "cake-cutting" (hoặc "box"), simulationKind = "cake-cutting".
     + BẮT BUỘC hiển thị dạng BOX (Dạng hộp 2D rõ ràng):
       * Khung chiếc bánh ban đầu [0, w] x [0, h] trong geometryData.boxes.
       * Điểm cắt (x, y) và 2 đường cắt ngang / dọc (segments) xuất phát từ (x, y).
       * Miếng bánh được cắt tạo thành một hộp (box) có highlight: true và nhãn diện tích ("Diện tích = ...").
       * Các miếng bánh đã cắt ở các bước trước (isTaken: true) và các miếng bánh còn lại.
6. BÀI TOÁN TÒA NHÀ & THANG MÁY (BUILDING & ELEVATOR):
   - Khi đề bài mô tả tòa nhà h tầng, thang máy di chuyển giữa các tầng, các nút bấm +a, +b, +c, trở về tầng 1 (như ELEVATOR II):
     + BẮT BUỘC chọn viewType = "building", subType = "elevator", simulationKind = "elevator".
     + TUYỆT ĐỐI KHÔNG gán nhầm vào "graph" tạo node tròn trôi nổi!
     + Cung cấp "buildingData": { "totalFloors": h, "currentFloor": ..., "visitedFloors": [...], "buttons": [...] }.
7. BÀI TOÁN CỘT ĐỨNG / HISTOGRAM / NƯỚC ĐỌNG (COLUMNS / HISTOGRAM / TRAPPING RAIN WATER):
   - Khi đề bài mô tả các cột, độ cao của các cột, thanh đứng, histogram, nước mưa đọng (trapping rain water):
     + BẮT BUỘC chọn viewType = "columns", subType = "histogram" | "trapping-water" | "bars".
     + Độ cao của các cột phải phản ánh chính xác tỷ lệ (ratio = height / maxHeight).
     + Nếu có nước đọng, cung cấp "waterHeight" trên từng cột.

17 DẠNG TRỰC QUAN HÓA (viewType) VÀ subType HÃY CHỌN DẠNG CHÍNH XÁC NHẤT:
1. "building": Tòa nhà tháp đứng, thang máy di chuyển giữa các tầng, các tầng đã đến / chưa đến, bảng nút bấm. (subType: "elevator", "floors", "tower")
2. "columns": Các cột đứng phản ánh chính xác tỷ lệ độ cao, histogram, nước đọng (trapping rain water), so sánh chiều cao. (subType: "histogram", "trapping-water", "bars", "heights")
3. "array": Dãy số, mảng 1D, mảng tiền tố, cửa sổ trượt. (subType: "1d", "multi-array", "window", "prefix-sum")
4. "grid": Lưới ô vuông, ma trận, bảng số, trò chơi sinh mệnh, bóng đèn lưới. (subType: "matrix", "maze", "game-of-life", "lighting", "field")
5. "tree": Cây nhị phân, cây tổng quát, đổi gốc (reroot), LCA. (subType: "binary", "n-ary", "reroot", "lca")
6. "graph": Đồ thị vô hướng, có hướng, trọng số, luồng mạng. (subType: "directed", "undirected", "weighted", "flow", "bipartite")
7. "intervals": Các đoạn [L, R], giao nhau của các đoạn, phủ đoạn. (subType: "timeline", "merging", "coverage")
8. "circular": Vòng tròn Josephus, bàn tròn, bộ đệm vòng (ring buffer), kim đồng hồ. (subType: "josephus", "ring-buffer", "clock", "wheel")
9. "geometry": Hình học tọa độ 2D, điểm, đoạn thẳng, đa giác, bao lồi, đường tròn, vector, cắt bánh / phân chia hình chữ nhật (dạng box). (subType: "cartesian", "convex-hull", "points-segments", "polygons", "box", "cake-cutting")
10. "string": Xâu ký tự, so khớp mẫu, xâu con, LCS, khoảng cách Levenshtein. (subType: "comparison", "pattern-matching", "subsequence", "edit-distance")
11. "timeline": Lịch trình công việc, nhiều kênh/phòng (lanes), sự kiện theo thời gian. (subType: "schedule", "intervals", "gantt", "events")
12. "mapping": Ánh xạ tập nguồn sang tập đích, ghép cặp cực đại (bipartite matching), hàm ánh xạ. (subType: "bipartite", "function", "permutation", "relations")
13. "containers": Bình nước (water jugs), balo, ngăn xếp/hàng đợi trực quan, thùng chứa có dung tích. (subType: "water-jugs", "knapsack", "bins", "stack-queue")
14. "movement": Di chuyển thực thể trên mặt phẳng 2D, robot đi theo lệnh (N/S/E/W), quỹ đạo hạt. (subType: "robot", "particles", "simulation-2d", "grid-walker")
15. "board": Trò chơi bàn cờ (Chess, Cờ ca-rô, N-Queens, Mã đi tuần, 2048). (subType: "chess", "checkers", "tic-tac-toe", "grid-game")
16. "state-machine": Máy trạng thái hữu hạn (FSM / DFA / NFA), biểu thức chính quy, chuỗi chuyển trạng thái. (subType: "dfa", "nfa", "regex", "transitions")
17. "generic-scene": Mô hình phối cảnh linh hoạt với các thực thể, hộp nhóm và mũi tên liên kết. (subType: "diagram", "composite", "domain-model")

ĐỀ BÀI HOẶC ẢNH CHỤP ĐỀ BÀI:
${problemText}
${sampleInstruction}

HÃY PHÂN TÍCH VÀ TRẢ VỀ JSON HỢP LỆ DUY NHẤT (TUYỆT ĐỐI KHÔNG CHÈN COMMENT // HOẶC /* */ VÀO TRONG JSON):
{
  "problemTitle": "Tên bài toán ngắn gọn, chuẩn xác",
  "problemSummary": "Tóm tắt 1-2 câu ngắn gọn về mục tiêu và quy tắc bài toán",
  "problemStatement": "Toàn văn đề bài đã đọc được",
  "inputFormat": "Mô tả quy cách dữ liệu đầu vào",
  "outputFormat": "Mô tả quy cách dữ liệu đầu ra",
  "constraints": "Các ràng buộc N, M, T...",
  "semanticRules": ["Quy tắc 1...", "Quy tắc 2..."],
  "tags": ["Tag1", "Tag2"],
  "sampleInput": "Dữ liệu input của test mẫu",
  "sampleOutput": "Dữ liệu output chính xác tương ứng",
  "viewType": "một trong 15 viewType ở trên",
  "subType": "subType tương ứng",
  "indexBase": 1,
  "visualizationSpec": {
    "viewType": "...",
    "subType": "...",
    "indexBase": 1,
    "showPointers": false,
    "directed": false
  },
  "rootId": "id_đỉnh_gốc_nếu_là_cây",
  "simulationKind": "cake-cutting | power-plant | deque-game | water-tanks | grid-path | none",
  "frames": [
    {
      "step": 0,
      "description": "Giải thích chi tiết trạng thái ở bước này bằng tiếng Việt rõ ràng",
      "elements": [2, 8, 3, 12, 50],
      "highlights": [...],
      "pointers": {},
      "grid": [...],
      "cellHighlights": [...],
      "nodes": [...],
      "edges": [...],
      "geometryData": {
        "points": [...],
        "segments": [...],
        "polygons": [...],
        "circles": [...],
        "vectors": [...]
      },
      "stringData": {
        "lanes": [...]
      },
      "timelineData": {
        "lanes": [...],
        "currentTime": 0
      },
      "mappingData": {
        "sourceLane": { "title": "...", "elements": [...] },
        "targetLane": { "title": "...", "elements": [...] },
        "links": [...]
      },
      "containersData": {
        "containers": [...],
        "transfers": [...]
      },
      "movementData": {
        "fieldWidth": 10,
        "fieldHeight": 10,
        "entities": [...],
        "obstacles": [...],
        "currentAction": "..."
      },
      "boardData": {
        "rows": 8,
        "cols": 8,
        "pieces": [...],
        "lastMove": { ... }
      },
      "circularData": {
        "items": [...],
        "pointers": [...]
      },
      "stateMachineData": {
        "states": [...],
        "transitions": [...],
        "tape": [...]
      },
      "genericSceneData": {
        "entities": [...],
        "groups": [...],
        "arrows": [...]
      },
      "variables": {
        "tên_biến": "giá trị"
      }
    }
  ]
}
`;
}

export function buildCustomTestPrompt(
  problemTitle: string,
  problemSummary: string,
  viewType: ViewType,
  customTestInput: string,
  customTestOutput: string,
  context?: Partial<CustomTestContext>
): string {
  const hasExpectedOutput = !!customTestOutput && customTestOutput.trim() !== '';

  const expectedOutputInstructions = hasExpectedOutput ? `
LƯU Ý ĐẶC BIỆT VỀ OUTPUT MONG ĐỢI CỦA NGƯỜI DÙNG:
Người dùng cung cấp Output mong đợi (Expected Output):
${customTestOutput.trim()}

QUY TRÌNH ĐỐI SOÁT VÀ TỰ KIỂM TRA OUTPUT:
1. Bạn hãy giải thuật toán bài toán một cách độc lập và chính xác nhất cho Custom Input trên để tìm ra kết quả đúng (calculated output).
2. So sánh kết quả tính toán của bạn với Output mong đợi của người dùng:
   - Nếu kết quả tính toán KHỚP với Output mong đợi của người dùng:
     + Đặt "outputMatches": true
     + Đặt "sampleOutput": "${customTestOutput.trim()}"
     + Đặt "userExpectedOutput": "${customTestOutput.trim()}"
     + Đặt "outputMismatchWarning": null
   - Nếu kết quả tính toán KHÁC với Output mong đợi của người dùng:
     + Hãy kiểm tra lại thật kỹ xem bạn có tính nhầm không.
     + Nếu bạn chắc chắn rằng Output của người dùng bị SAI theo quy tắc đề bài:
       - Đặt "outputMatches": false
       - Đặt "userExpectedOutput": "${customTestOutput.trim()}"
       - Đặt "outputMismatchWarning": "⚠️ Output bạn nhập (${customTestOutput.trim()}) không khớp với kết quả chính xác theo quy tắc đề bài ([kết quả đúng]). Lý do: [nêu ngắn gọn lý do tại sao sai]..."
       - Đặt "sampleOutput": "[kết quả đúng]"
` : '';

  const fullContextText = context ? `
BỐI CẢNH TOÀN DIỆN CỦA BÀI TOÁN:
- Toàn văn đề bài:
${context.problemStatement || problemSummary}
- Quy cách Input: ${context.inputFormat || 'N/A'}
- Quy cách Output: ${context.outputFormat || 'N/A'}
- Ràng buộc: ${context.constraints || 'N/A'}
- Quy tắc ngữ nghĩa: ${(context.semanticRules || []).join('; ') || 'N/A'}
- Dạng trực quan hóa: ${viewType} (subType: ${context.subType || 'standard'})
- Chỉ số cơ sở: indexBase = ${context.indexBase ?? 1}
` : '';

  return `
Bài toán: "${problemTitle}"
Mô tả: "${problemSummary}"
Dạng trực quan hóa (viewType): "${viewType}"
${fullContextText}

Người dùng muốn mô phỏng với CUSTOM TEST CASE sau:
${customTestInput}
${expectedOutputInstructions}

QUY TẮC MÔ PHỎNG:
- Bám sát bối cảnh bài toán và quy tắc ngữ nghĩa ở trên.
- NẾU INPUT CÓ NHIỀU TEST CASE (T >= 2 hoặc nhiều bộ test/truy vấn): BẮT BUỘC mô phỏng LẦN LƯỢT TẤT CẢ các test case trong danh sách frames (hết test 1 thì chuyển sang test 2 và chạy tiếp). TUYỆT ĐỐI KHÔNG dừng lại sau test 1!
- Không ép giải thuật Two-pointers, Dijkstra, DP... nếu đề bài không yêu cầu.
- Nếu số bước hữu hạn và dưới 20 bước: BẮT BUỘC 100% PHẢI MÔ TẢ ĐẦY ĐỦ TỪNG BƯỚC MỘT (t=0, t=1, t=2... đến kết quả). TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY CÓC!
- Nếu số bước lớn (> 20): Mô phỏng khoảng 8 - 15 bước tiêu biểu.
- CHỈ thêm pointers khi đề bài dùng con trỏ.

Hãy mô phỏng từng bước test này theo đúng định dạng "${viewType}" và trả về JSON:
{
  "problemTitle": "${problemTitle}",
  "problemSummary": "${problemSummary}",
  "tags": ["Custom-Test"],
  "sampleInput": "${customTestInput}",
  "sampleOutput": "Kết quả tương ứng",
  "userExpectedOutput": "${hasExpectedOutput ? customTestOutput.trim() : ''}",
  "outputMatches": ${hasExpectedOutput ? 'true' : 'true'},
  "outputMismatchWarning": null,
  "viewType": "${viewType}",
  "subType": "${context?.subType || ''}",
  "indexBase": ${context?.indexBase ?? 1},
  "visualizationSpec": {
    "viewType": "${viewType}",
    "subType": "${context?.subType || ''}",
    "indexBase": ${context?.indexBase ?? 1}
  },
  "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả bước này bằng tiếng Việt",
      "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
      "grid": ...,
      "selectedBox": ...,
      "cellHighlights": ...,
      "intervals": ...,
      "nodes": ...,
      "edges": ...,
      "elements": ...,
      "highlights": ...,
      "pointers": {},
      "variables": ...
    }
  ]
}
`;
}
