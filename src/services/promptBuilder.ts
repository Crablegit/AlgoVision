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
8. BẢO TOÀN ĐẦY ĐỦ CÁC ĐỈNH VÀ CẠNH CỦA CÂY / ĐỒ THỊ (TREE & GRAPH COMPLETENESS):
   - Khi đề bài mô tả đồ thị hoặc cây gồm N đỉnh (ví dụ N = 4 hoặc N = 10 đỉnh):
     + Frame 0 (Khởi tạo) BẮT BUỘC PHẢI KHỞI TẠO ĐẦY ĐỦ TẤT CẢ N ĐỈNH trong mảng "nodes" (từ đỉnh 1 đến N).
     + Mọi cạnh ban đầu phải có trong mảng "edges".
     + Trong CÁC FRAME TIẾP THEO: BẮT BUỘC PHẢI GIỮ ĐẦY ĐỦ TẤT CẢ N ĐỈNH trong "nodes". Khi một đỉnh/cạnh được xét hay đến thăm, đặt "highlight": true trên đỉnh/cạnh đó. TUYỆT ĐỐI KHÔNG ĐƯỢC xóa các đỉnh khác hoặc chỉ để lại 1 đỉnh trong mảng "nodes"!
     + Nếu là rừng cây (nhiều cây độc lập / DSU như Bosses): Mọi cây độc lập đều phải có đỉnh trong mảng "nodes".
9. BẮT BUỘC SINH ĐỦ BƯỚC CHO MỌI TRUY VẤN VÀ DÒNG OUTPUT (QUERIES & OUTPUT STEPS):
   - TUYỆT ĐỐI KHÔNG ĐƯỢC CHỈ SINH 1 BƯỚC KHỞI TẠO RỒI DỪNG LẠI!
   - Nếu đề bài có các truy vấn (queries) hoặc nhiều dòng output (ví dụ: bài Bosses có 20 truy vấn và 11 dòng output, hay bài Người giao hàng có 4 nhiệm vụ giao hàng):
     + BẮT BUỘC phải sinh lần lượt từng frame cho từng truy vấn / thao tác (tối thiểu 4 đến 15 frames tiêu biểu).
     + Mỗi khi một truy vấn in ra kết quả (output), frame đó BẮT BUỘC phải ghi rõ "outputContribution": "giá_trị_in_ra" và giải thích cụ thể trong "description" tại sao ra kết quả đó!
10. QUY TẮC MÔ HÌNH PHỐI CẢNH GENERIC-SCENE & THỰC THỂ (CHỐNG ĐÈ LẤN / ANTI-OVERLAP):
   - Khi chọn viewType = "generic-scene" (ví dụ bài toán búp bê Matryoshka, vật thể lồng nhau, hệ thống phân tán, luồng logic miền):
     + Các thực thể trong "entities" phải có tọa độ phân bố rõ ràng, tuyệt đối không được đặt trùng hoặc sát sạt nhau khiến các ô bị đè lên nhau.
     + Khoảng cách tối thiểu giữa các thực thể: theo chiều dọc tối thiểu 75px (hoặc delta y >= 18%), theo chiều ngang tối thiểu 220px (hoặc delta x >= 28%).
     + Với bài toán búp bê Matryoshka hoặc vật thể lồng nhau: hiển thị rõ kích thước (R, H), trạng thái búp bê nào lồng trong búp bê nào (lồng tối ưu), và thông số truy vấn (A, B) trong thẻ riêng biệt rõ ràng.
11. QUY TẮC THÙNG CHỨA / BÌNH NƯỚC / BA LÔ (CONTAINERS & KNAPSACK - DẠNG NƯỚC & DẠNG TĨNH KHỐI):
   - Khi chọn viewType = "containers":
     + Phân biệt 2 dạng hiển thị cốt lõi:
       1. Dạng nước / Chất lỏng hợp nhất (subType: "water-jugs" | "fountain" | "tanks"): Cung cấp "capacity" (dung tích) và "currentAmount" (mực nước hiện tại). Mực nước dâng lên liên tục theo dạng sóng chất lỏng. Khi rót nước vào hồ nào (như bài Fountain), "currentAmount" của hồ đó BẮT BUỘC phải tăng tương ứng ở frame đó! Nếu nước tràn sang hồ khác, thêm "transfers": [{ "from": "Hồ 1", "to": "Hồ 2", "amount": ... }].
       2. Dạng tĩnh khối / Ba lô (subType: "knapsack" | "bins" | "stack-queue"): Cung cấp "capacity" (tải trọng tối đa) và danh sách "items": [{ "id": "1", "label": "Vật 1", "weight": w, "value": v }] bên trong từng container. Mỗi vật phẩm sẽ hiển thị thành một khối hộp (📦) riêng biệt xếp chồng từ đáy ba lô lên.
     + Trong MỌI FRAME: BẮT BUỘC phải cập nhật "containersData" với đầy đủ tất cả các thùng/hồ/ba lô, không được để trống hoặc chỉ gửi frame 0!
12. QUY TẮC DẠNG PHỦ ĐOẠN / TRỤC TỌA ĐỘ OX (INTERVALS & RANGE QUERIES):
   - Khi chọn viewType = "intervals" (hoặc các bài toán phủ đoạn, rèm che, khoảng giao nhau, range queries như bài Curtains):
     + Hệ thống sẽ trực quan hóa trên Hệ trục tọa độ 1D (chỉ vẽ trục Ox) với các vạch chia và đường gióng thẳng đứng.
     + Trong MỌI FRAME: BẮT BUỘC phải cung cấp mảng "intervals" với đầy đủ các đoạn thẳng có sẵn:
       [{ "id": "1", "label": "Rèm 1 [1, 2]", "start": 1, "end": 2, "highlight": true }, ...]
     + Nếu có đoạn truy vấn mục tiêu cần phủ (như truy vấn [1, 5] trong bài Curtains): BẮT BUỘC phải thêm đoạn mục tiêu đó vào "intervals" với cờ "isTarget": true (hoặc label: "Mục tiêu [1, 5]")!
     + Các đoạn thẳng được chọn để phủ ở bước hiện tại thì đặt "highlight": true.

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
- NẾU INPUT CÓ NHIỀU TEST CASE HOẶC NHIỀU TRUY VẤN: BẮT BUỘC mô phỏng LẦN LƯỢT TỪNG TRUY VẤN trong danh sách frames (tối thiểu 4 đến 15 frames). TUYỆT ĐỐI KHÔNG chỉ sinh 1 bước khởi tạo rồi dừng lại!
- Với mỗi truy vấn có in ra kết quả (output), frame tương ứng BẮT BUỘC phải ghi rõ "outputContribution": "giá_trị_in_ra" và giải thích lý do trong "description".
- CÂY / ĐỒ THỊ: MỌI frame đều PHẢI chứa ĐẦY ĐỦ TẤT CẢ các đỉnh (nodes) và các cạnh (edges) của đồ thị/cây. Đỉnh/cạnh nào đang được xét thì đặt "highlight": true. TUYỆT ĐỐI KHÔNG xóa các đỉnh khác!
- Không ép giải thuật Two-pointers, Dijkstra, DP... nếu đề bài không yêu cầu.
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
