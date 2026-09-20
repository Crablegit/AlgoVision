import { SimulationResult } from '../types';

export const mockAcceptanceTests: Record<string, SimulationResult> = {
  // 1. Deque Game (array + window)
  dequeGame: {
    problemTitle: "Trò chơi xóa số hai đầu (CPBDEQUEGAME)",
    problemSummary: "Tìm số phần tử tối thiểu cần xóa ở hai đầu deque sao cho các phần tử còn lại có tổng bằng S.",
    tags: ["Array", "Deque", "Sliding Window"],
    sampleInput: "1\n16 2\n1 1 0 0 1 0 0 1 1 0 0 0 0 0 1 1",
    sampleOutput: "7",
    viewType: "array",
    subType: "window",
    indexBase: 0,
    simulationKind: "deque-game",
    visualizationSpec: {
      viewType: "array",
      subType: "window",
      indexBase: 0,
      showPointers: true
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo dãy 16 phần tử, tổng cần đạt S = 2.",
        elements: [1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        highlights: [],
        pointers: {},
        status: "normal"
      },
      {
        step: 1,
        description: "Tìm thấy đoạn con dài nhất [4..12] có tổng = 2. Cần xóa 4 phần tử đầu và 3 phần tử cuối => Tổng số bước xóa là 7.",
        elements: [1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        highlights: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        deleted: [0, 1, 2, 3, 13, 14, 15],
        pointers: { L: 4, R: 12 },
        status: "done",
        variables: { "tổng_số_bước_xóa": 7 }
      }
    ]
  },

  // 2. Robot di chuyển (movement)
  robotMovement: {
    problemTitle: "Robot thám hiểm sàn nhà (Robot Movement)",
    problemSummary: "Robot di chuyển theo các lệnh N, S, E, W trên sàn 10x10 có chướng ngại vật.",
    tags: ["Movement", "Simulation"],
    sampleInput: "10 10\nSTART 2 2 N\nMOVE 3\nTURN_RIGHT\nMOVE 4",
    sampleOutput: "6 5 E",
    viewType: "movement",
    subType: "robot",
    indexBase: 1,
    visualizationSpec: {
      viewType: "movement",
      subType: "robot",
      indexBase: 1
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo robot tại vị trí (2, 2) hướng Bắc (N).",
        movementData: {
          fieldWidth: 10,
          fieldHeight: 10,
          entities: [{ id: "r1", label: "Robot", x: 1, y: 1, direction: "N", icon: "🤖" }],
          obstacles: [{ x: 3, y: 3, label: "Đá" }],
          currentAction: "START"
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Robot di chuyển 3 bước lên phía Bắc, xoay sang hướng Đông và tiến 4 bước tới (6, 5).",
        movementData: {
          fieldWidth: 10,
          fieldHeight: 10,
          entities: [{
            id: "r1",
            label: "Robot",
            x: 5,
            y: 4,
            direction: "E",
            icon: "🤖",
            trail: [{ x: 1, y: 1 }, { x: 1, y: 4 }, { x: 5, y: 4 }]
          }],
          obstacles: [{ x: 3, y: 3, label: "Đá" }],
          currentAction: "FINISH"
        },
        status: "done"
      }
    ]
  },

  // 3. Grid Pathfinding (grid)
  gridPathfinding: {
    problemTitle: "Đường đi trên lưới có vật cản",
    problemSummary: "Tìm số đường đi từ ô (1,1) đến ô (M, N) chỉ đi sang phải hoặc xuống dưới.",
    tags: ["Grid", "Pathfinding", "DP"],
    sampleInput: "3 3\n2 2",
    sampleOutput: "2",
    viewType: "grid",
    subType: "maze",
    indexBase: 1,
    visualizationSpec: {
      viewType: "grid",
      subType: "maze",
      indexBase: 1
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo lưới 3x3 với ô cấm tại (2,2).",
        grid: [
          ["·", "·", "·"],
          ["·", "X", "·"],
          ["·", "·", "·"]
        ],
        cellHighlights: [
          { r: 0, c: 0, status: "start" },
          { r: 1, c: 1, status: "blocked" },
          { r: 2, c: 2, status: "goal" }
        ],
        status: "normal"
      },
      {
        step: 1,
        description: "Đường đi thứ nhất: (1,1) -> (1,2) -> (1,3) -> (2,3) -> (3,3).",
        grid: [
          ["✓", "✓", "✓"],
          ["·", "X", "✓"],
          ["·", "·", "✓"]
        ],
        cellHighlights: [
          { r: 0, c: 0, status: "path", color: "sky" },
          { r: 0, c: 1, status: "path", color: "sky" },
          { r: 0, c: 2, status: "path", color: "sky" },
          { r: 1, c: 2, status: "path", color: "sky" },
          { r: 2, c: 2, status: "goal", color: "sky" }
        ],
        status: "found"
      }
    ]
  },

  // 4. Containers / Water Jugs (containers)
  containersWaterJugs: {
    problemTitle: "Bài toán đong nước (Water Jugs)",
    problemSummary: "Cho 2 bình nước dung tích 5L và 3L. Tìm cách đong đúng 4L nước.",
    tags: ["Containers", "Simulation", "BFS"],
    sampleInput: "5 3 4",
    sampleOutput: "6 bước",
    viewType: "containers",
    subType: "water-jugs",
    visualizationSpec: {
      viewType: "containers",
      subType: "water-jugs"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo hai bình A (5L) và B (3L) đều rỗng.",
        containersData: {
          containers: [
            { id: "A", label: "Bình A (5L)", capacity: 5, currentAmount: 0 },
            { id: "B", label: "Bình B (3L)", capacity: 3, currentAmount: 0 }
          ]
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Đổ đầy bình A (5L). Rót từ A sang B (3L). Bình A còn lại đúng 2L.",
        containersData: {
          containers: [
            { id: "A", label: "Bình A", capacity: 5, currentAmount: 2, highlight: true },
            { id: "B", label: "Bình B", capacity: 3, currentAmount: 3 }
          ],
          transfers: [{ from: "Bình A", to: "Bình B", amount: 3 }]
        },
        status: "normal"
      },
      {
        step: 2,
        description: "Hoàn thành: Bình A chứa đúng 4L nước theo yêu cầu!",
        containersData: {
          containers: [
            { id: "A", label: "Bình A (4L ĐÍCH)", capacity: 5, currentAmount: 4, highlight: true },
            { id: "B", label: "Bình B", capacity: 3, currentAmount: 0 }
          ]
        },
        status: "done",
        variables: { "lượng_nước_đong_được": "4L" }
      }
    ]
  },

  // 5. Power Plant Lighting (graph)
  powerPlantLighting: {
    problemTitle: "Mạng lưới nhà máy điện (Power Plant)",
    problemSummary: "Xác định các thành phố được cấp điện trong bán kính R từ các nhà máy điện.",
    tags: ["Graph", "BFS", "Power-Plant"],
    sampleInput: "5 4 1\n1 2\n2 3\n3 4\n4 5\n1 2",
    sampleOutput: "11100",
    viewType: "graph",
    subType: "undirected",
    simulationKind: "power-plant",
    visualizationSpec: {
      viewType: "graph",
      subType: "undirected"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo 5 thành phố. Đặt nhà máy tại thành phố 1 với bán kính R=2 km.",
        nodes: [
          { id: "1", label: "1", color: "plant", status: "plant", highlight: true },
          { id: "2", label: "2", color: "dark", status: "off" },
          { id: "3", label: "3", color: "dark", status: "off" },
          { id: "4", label: "4", color: "dark", status: "off" },
          { id: "5", label: "5", color: "dark", status: "off" }
        ],
        edges: [
          { from: "1", to: "2" },
          { from: "2", to: "3" },
          { from: "3", to: "4" },
          { from: "4", to: "5" }
        ],
        status: "normal"
      },
      {
        step: 1,
        description: "Điện lan truyền đến thành phố 2 (khoảng cách 1) và thành phố 3 (khoảng cách 2). Kết quả nhị phân: 11100.",
        nodes: [
          { id: "1", label: "1", color: "plant", status: "plant", highlight: true },
          { id: "2", label: "2", color: "yellow", status: "lit", highlight: true },
          { id: "3", label: "3", color: "yellow", status: "lit", highlight: true },
          { id: "4", label: "4", color: "dark", status: "off" },
          { id: "5", label: "5", color: "dark", status: "off" }
        ],
        edges: [
          { from: "1", to: "2", highlight: true, color: "yellow" },
          { from: "2", to: "3", highlight: true, color: "yellow" },
          { from: "3", to: "4" },
          { from: "4", to: "5" }
        ],
        status: "done",
        variables: { "kết_quả": "11100" }
      }
    ]
  },

  // 6. Subarray Sum Equals K (array)
  subarraySumK: {
    problemTitle: "Đoạn con có tổng bằng K",
    problemSummary: "Đếm số đoạn con liên tiếp có tổng bằng K.",
    tags: ["Array", "Prefix-Sum"],
    sampleInput: "5 3\n1 2 3 -2 2",
    sampleOutput: "3",
    viewType: "array",
    subType: "prefix-sum",
    indexBase: 1,
    visualizationSpec: {
      viewType: "array",
      subType: "prefix-sum",
      indexBase: 1
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo mảng A = [1, 2, 3, -2, 2], K = 3.",
        elements: [1, 2, 3, -2, 2],
        highlights: [],
        status: "normal"
      },
      {
        step: 1,
        description: "Tìm thấy đoạn con [1..2] có tổng 1 + 2 = 3.",
        elements: [1, 2, 3, -2, 2],
        highlights: [0, 1],
        status: "found",
        variables: { "đoạn_thỏa_mãn": "[1, 2]", "tổng": 3 }
      },
      {
        step: 2,
        description: "Tìm thấy đoạn con [3..3] gồm phần tử 3.",
        elements: [1, 2, 3, -2, 2],
        highlights: [2],
        status: "found",
        variables: { "đoạn_thỏa_mãn": "[3]", "tổng": 3 }
      }
    ]
  },

  // 7. Geometry - Convex Hull (geometry)
  geometryConvexHull: {
    problemTitle: "Bao lồi tập điểm (Convex Hull)",
    problemSummary: "Tìm bao lồi nhỏ nhất bao bọc tập hợp các điểm trong mặt phẳng 2D.",
    tags: ["Geometry", "Convex-Hull"],
    sampleInput: "6\n0 0\n1 2\n2 1\n3 3\n0 3\n3 0",
    sampleOutput: "4 đỉnh bao lồi",
    viewType: "geometry",
    subType: "convex-hull",
    visualizationSpec: {
      viewType: "geometry",
      subType: "convex-hull"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo 6 điểm trên mặt phẳng tọa độ.",
        geometryData: {
          points: [
            { id: "p1", x: 0, y: 0, label: "A" },
            { id: "p2", x: 1, y: 2, label: "B" },
            { id: "p3", x: 2, y: 1, label: "C" },
            { id: "p4", x: 3, y: 3, label: "D" },
            { id: "p5", x: 0, y: 3, label: "E" },
            { id: "p6", x: 3, y: 0, label: "F" }
          ]
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Xác định đa giác bao lồi qua 4 điểm cực biên: (0,0) -> (3,0) -> (3,3) -> (0,3).",
        geometryData: {
          points: [
            { id: "p1", x: 0, y: 0, label: "A", highlight: true },
            { id: "p2", x: 1, y: 2, label: "B" },
            { id: "p3", x: 2, y: 1, label: "C" },
            { id: "p4", x: 3, y: 3, label: "D", highlight: true },
            { id: "p5", x: 0, y: 3, label: "E", highlight: true },
            { id: "p6", x: 3, y: 0, label: "F", highlight: true }
          ],
          polygons: [
            {
              id: "hull",
              points: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }],
              highlight: true
            }
          ]
        },
        status: "done"
      }
    ]
  },

  // 8. String Pattern Matching (string)
  stringMatching: {
    problemTitle: "So khớp chuỗi KMP",
    problemSummary: "Tìm các vị trí xuất hiện của mẫu P trong văn bản S.",
    tags: ["String", "KMP"],
    sampleInput: "ABABDABACDABABCABAB\nABABCABAB",
    sampleOutput: "10",
    viewType: "string",
    subType: "pattern-matching",
    indexBase: 0,
    visualizationSpec: {
      viewType: "string",
      subType: "pattern-matching",
      indexBase: 0
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo văn bản S và mẫu tìm kiếm P.",
        stringData: {
          lanes: [
            { id: "s", label: "Văn bản S", chars: "ABABDABACDABABCABAB" },
            { id: "p", label: "Mẫu P", chars: "ABABCABAB", pointers: { j: 0 } }
          ]
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Tìm thấy sự trùng khớp hoàn toàn tại chỉ số 10!",
        stringData: {
          lanes: [
            { id: "s", label: "Văn bản S", chars: "ABABDABACDABABCABAB", substring: { start: 10, end: 18, label: "Khớp hoàn toàn" } },
            { id: "p", label: "Mẫu P", chars: "ABABCABAB", matches: Array(9).fill("match") }
          ]
        },
        status: "done",
        variables: { "vị_trí_khớp": 10 }
      }
    ]
  },

  // 9. Interval Scheduling (timeline)
  intervalScheduling: {
    problemTitle: "Lập lịch phòng họp (Meeting Rooms)",
    problemSummary: "Tìm số lượng phòng họp tối thiểu cần thiết để phục vụ các cuộc họp.",
    tags: ["Timeline", "Intervals", "Greedy"],
    sampleInput: "3\n0 30\n5 10\n15 20",
    sampleOutput: "2",
    viewType: "timeline",
    subType: "schedule",
    visualizationSpec: {
      viewType: "timeline",
      subType: "schedule"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo 3 khoảng thời gian cuộc họp: [0, 30], [5, 10], [15, 20].",
        timelineData: {
          lanes: [
            {
              id: "r1",
              label: "Phòng 1",
              tasks: [{ id: "m1", label: "Cuộc họp A", start: 0, end: 30, highlight: true }]
            },
            {
              id: "r2",
              label: "Phòng 2",
              tasks: [
                { id: "m2", label: "Cuộc họp B", start: 5, end: 10 },
                { id: "m3", label: "Cuộc họp C", start: 15, end: 20 }
              ]
            }
          ],
          currentTime: 5
        },
        status: "done",
        variables: { "số_phòng_tối_thiểu": 2 }
      }
    ]
  },

  // 10. Bipartite Matching (mapping)
  bipartiteMatching: {
    problemTitle: "Ghép cặp cực đại (Max Bipartite Matching)",
    problemSummary: "Phân công tối đa các công việc cho các ứng viên phù hợp.",
    tags: ["Mapping", "Graph", "Matching"],
    sampleInput: "3 3\n1 1\n1 2\n2 2\n3 3",
    sampleOutput: "3",
    viewType: "mapping",
    subType: "bipartite",
    visualizationSpec: {
      viewType: "mapping",
      subType: "bipartite"
    },
    frames: [
      {
        step: 0,
        description: "Ánh xạ giữa tập ứng viên và tập công việc.",
        mappingData: {
          sourceLane: {
            title: "Ứng viên",
            elements: [{ id: "u1", label: "Ứng viên 1" }, { id: "u2", label: "Ứng viên 2" }, { id: "u3", label: "Ứng viên 3" }]
          },
          targetLane: {
            title: "Công việc",
            elements: [{ id: "v1", label: "Job A" }, { id: "v2", label: "Job B" }, { id: "v3", label: "Job C" }]
          },
          links: [
            { id: "l1", source: "u1", target: "v1", status: "matched", highlight: true },
            { id: "l2", source: "u2", target: "v2", status: "matched", highlight: true },
            { id: "l3", source: "u3", target: "v3", status: "matched", highlight: true }
          ]
        },
        status: "done",
        variables: { "số_cặp_ghép": 3 }
      }
    ]
  },

  // 11. Tree Dynamic Rerooting (tree)
  treeRerooting: {
    problemTitle: "Đổi gốc trên cây (Tree Rerooting DP)",
    problemSummary: "Tính tổng khoảng cách từ mỗi đỉnh đến tất cả các đỉnh khác trên cây.",
    tags: ["Tree", "DP", "Rerooting"],
    sampleInput: "4\n1 2\n1 3\n3 4",
    sampleOutput: "6 9 7 10",
    viewType: "tree",
    subType: "reroot",
    visualizationSpec: {
      viewType: "tree",
      subType: "reroot"
    },
    rootId: "1",
    frames: [
      {
        step: 0,
        description: "Cây ban đầu với gốc là đỉnh 1.",
        rootId: "1",
        nodes: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }],
        edges: [{ from: "1", to: "2" }, { from: "1", to: "3" }, { from: "3", to: "4" }],
        status: "normal"
      },
      {
        step: 1,
        description: "Đổi gốc sang đỉnh 3. Cây được xoay lại với đỉnh 3 làm gốc mới.",
        rootId: "3",
        nodes: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3", highlight: true }, { id: "4", label: "4" }],
        edges: [{ from: "3", to: "1" }, { from: "1", to: "2" }, { from: "3", to: "4" }],
        status: "normal",
        variables: { "gốc_mới": "3" }
      }
    ]
  },

  // 12. Josephus Problem (circular)
  josephusProblem: {
    problemTitle: "Trò chơi vòng tròn Josephus",
    problemSummary: "N người ngồi quanh bàn tròn, lần lượt loại người thứ K cho đến khi còn 1 người duy nhất.",
    tags: ["Circular", "Josephus"],
    sampleInput: "7 3",
    sampleOutput: "4",
    viewType: "circular",
    subType: "josephus",
    indexBase: 1,
    visualizationSpec: {
      viewType: "circular",
      subType: "josephus",
      indexBase: 1
    },
    frames: [
      {
        step: 0,
        description: "7 người đứng thành vòng tròn [1..7]. Bắt đầu đếm k=3.",
        circularData: {
          items: [
            { id: "1", label: "1" },
            { id: "2", label: "2" },
            { id: "3", label: "3" },
            { id: "4", label: "4" },
            { id: "5", label: "5" },
            { id: "6", label: "6" },
            { id: "7", label: "7" }
          ],
          pointers: [{ id: "p", label: "Đếm", targetIndex: 2 }]
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Người thứ 3 bị loại. Vòng tròn tiếp tục đếm từ người 4.",
        circularData: {
          items: [
            { id: "1", label: "1" },
            { id: "2", label: "2" },
            { id: "3", label: "3", eliminated: true },
            { id: "4", label: "4", highlight: true },
            { id: "5", label: "5" },
            { id: "6", label: "6" },
            { id: "7", label: "7" }
          ],
          pointers: [{ id: "p", label: "Đếm", targetIndex: 3 }]
        },
        status: "normal"
      },
      {
        step: 2,
        description: "Người sống sót cuối cùng là người số 4!",
        circularData: {
          items: [
            { id: "1", label: "1", eliminated: true },
            { id: "2", label: "2", eliminated: true },
            { id: "3", label: "3", eliminated: true },
            { id: "4", label: "4", highlight: true },
            { id: "5", label: "5", eliminated: true },
            { id: "6", label: "6", eliminated: true },
            { id: "7", label: "7", eliminated: true }
          ]
        },
        status: "done",
        variables: { "người_sống_sót": 4 }
      }
    ]
  },

  // 13. N-Queens (board)
  nQueensBoard: {
    problemTitle: "Bài toán 8 quân hậu (N-Queens)",
    problemSummary: "Đặt 8 quân hậu trên bàn cờ 8x8 sao cho không có hai quân hậu nào ăn nhau.",
    tags: ["Board", "Chess", "Backtracking"],
    sampleInput: "8",
    sampleOutput: "1 nghiệm hợp lệ",
    viewType: "board",
    subType: "chess",
    visualizationSpec: {
      viewType: "board",
      subType: "chess"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo bàn cờ 8x8 với 8 quân hậu được bố trí hợp lệ.",
        boardData: {
          rows: 8,
          cols: 8,
          pieces: [
            { id: "q1", r: 0, c: 0, symbol: "♛" },
            { id: "q2", r: 1, c: 4, symbol: "♛" },
            { id: "q3", r: 2, c: 7, symbol: "♛" },
            { id: "q4", r: 3, c: 5, symbol: "♛" },
            { id: "q5", r: 4, c: 2, symbol: "♛" },
            { id: "q6", r: 5, c: 6, symbol: "♛" },
            { id: "q7", r: 6, c: 1, symbol: "♛" },
            { id: "q8", r: 7, c: 3, symbol: "♛" }
          ]
        },
        status: "done"
      }
    ]
  },

  // 14. DFA String Validation (state-machine)
  dfaValidation: {
    problemTitle: "Máy trạng thái DFA kiểm tra số nhị phân chẵn",
    problemSummary: "DFA nhận chuỗi nhị phân kết thúc bằng '0'.",
    tags: ["State-Machine", "DFA", "Automata"],
    sampleInput: "1010",
    sampleOutput: "ACCEPT",
    viewType: "state-machine",
    subType: "dfa",
    visualizationSpec: {
      viewType: "state-machine",
      subType: "dfa"
    },
    frames: [
      {
        step: 0,
        description: "Khởi tạo trạng thái ban đầu q0. Băng đọc: '1010'.",
        stateMachineData: {
          states: [
            { id: "q0", label: "q0 (Lẻ)", isInitial: true, isCurrent: true },
            { id: "q1", label: "q1 (Chẵn)", isAccepting: true }
          ],
          transitions: [
            { id: "t1", from: "q0", to: "q0", symbol: "1" },
            { id: "t2", from: "q0", to: "q1", symbol: "0" },
            { id: "t3", from: "q1", to: "q0", symbol: "1" },
            { id: "t4", from: "q1", to: "q1", symbol: "0" }
          ],
          tape: ["1", "0", "1", "0"],
          tapeIndex: 0
        },
        status: "normal"
      },
      {
        step: 1,
        description: "Đọc xong chuỗi '1010', dừng tại trạng thái chấp nhận q1 => ACCEPT.",
        stateMachineData: {
          states: [
            { id: "q0", label: "q0 (Lẻ)", isInitial: true },
            { id: "q1", label: "q1 (Chẵn)", isAccepting: true, isCurrent: true }
          ],
          transitions: [
            { id: "t1", from: "q0", to: "q0", symbol: "1" },
            { id: "t2", from: "q0", to: "q1", symbol: "0" },
            { id: "t3", from: "q1", to: "q0", symbol: "1" },
            { id: "t4", from: "q1", to: "q1", symbol: "0", highlight: true }
          ],
          tape: ["1", "0", "1", "0"],
          tapeIndex: 3
        },
        status: "done",
        variables: { "kết_quả": "ACCEPT" }
      }
    ]
  },

  // 15. Elevator System (generic-scene)
  genericSceneElevator: {
    problemTitle: "Mô phỏng thang máy tòa nhà (Generic Scene)",
    problemSummary: "Hệ thống điều phối thang máy phục vụ các tầng trong tòa nhà.",
    tags: ["Generic-Scene", "Simulation"],
    sampleInput: "FLOORS 5\nCALL 3 UP\nCALL 1 UP",
    sampleOutput: "SERVED ALL",
    viewType: "generic-scene",
    subType: "diagram",
    visualizationSpec: {
      viewType: "generic-scene",
      subType: "diagram"
    },
    frames: [
      {
        step: 0,
        description: "Mô hình tòa nhà 5 tầng và buồng thang máy đang ở tầng 1.",
        genericSceneData: {
          groups: [
            { id: "tower", title: "Tòa nhà 5 tầng", x: 120, y: 40, w: 320, h: 280 }
          ],
          entities: [
            { id: "elev", label: "Thang máy", icon: "🛗", x: 280, y: 260, status: "Tầng 1", highlight: true },
            { id: "p1", label: "Khách gọi Tầng 3", icon: "👤", x: 180, y: 160, status: "Chờ lên" }
          ],
          arrows: [
            { id: "flow1", fromId: "elev", toId: "p1", label: "Di chuyển lên", highlight: true }
          ]
        },
        status: "normal"
      }
    ]
  },

  // 16. Multi-test case problem (T >= 2) (array)
  multiTestCaseArray: {
    problemTitle: "Tổng các phần tử chẵn (Multi-test case)",
    problemSummary: "Cho T test case, mỗi test tính tổng các phần tử chẵn trong dãy.",
    tags: ["Array", "Multi-Test"],
    sampleInput: "2\n3\n2 4 5\n4\n1 3 5 7",
    sampleOutput: "6\n0",
    viewType: "array",
    subType: "1d",
    indexBase: 1,
    visualizationSpec: {
      viewType: "array",
      subType: "1d",
      indexBase: 1
    },
    frames: [
      {
        step: 0,
        description: "Test Case 1/2: Dãy [2, 4, 5]. Các số chẵn là 2 và 4.",
        elements: [2, 4, 5],
        highlights: [0, 1],
        status: "done",
        variables: { "test_case": "1/2", "tổng_chẵn": 6 }
      },
      {
        step: 1,
        description: "Test Case 2/2: Dãy [1, 3, 5, 7]. Không có số chẵn nào.",
        elements: [1, 3, 5, 7],
        highlights: [],
        status: "done",
        variables: { "test_case": "2/2", "tổng_chẵn": 0 }
      }
    ]
  }
};
