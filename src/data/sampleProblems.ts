import { SampleProblem } from '../types';

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: 'two-sum-sorted',
    title: 'Two Sum II - Input Array Is Sorted',
    category: 'Two Pointers',
    difficulty: 'Easy',
    description: `Cho một mảng các số nguyên 'numbers' đã được sắp xếp theo thứ tự tăng dần. Tìm hai số sao cho tổng của chúng bằng một số 'target' cho trước.
Trả về các chỉ số (hoặc vị trí) của hai số đó.
Ví dụ: numbers = [2, 7, 11, 15], target = 9 -> Kết quả: index 0 và 1 (2 + 7 = 9).`,
    defaultInput: `numbers = [2, 7, 11, 15]\ntarget = 9`,
    initialResult: {
      problemTitle: "Two Sum II (Mảng đã sắp xếp)",
      problemSummary: "Sử dụng kỹ thuật 2 con trỏ (Left & Right) di chuyển từ hai đầu mảng vào giữa để tìm cặp số có tổng bằng target.",
      algorithmName: "Two Pointers Approach",
      complexity: {
        time: "O(n)",
        space: "O(1)"
      },
      dataStructure: "two_pointers",
      frames: [
        {
          step: 0,
          description: "Khởi tạo con trỏ: left ở vị trí 0 (giá trị 2), right ở vị trí 3 (giá trị 15). Target cần tìm là 9.",
          elements: [2, 7, 11, 15],
          highlights: [0, 3],
          pointers: { "left": 0, "right": 3 },
          variables: { "target": 9, "currentSum": 17, "leftVal": 2, "rightVal": 15 },
          status: "comparing"
        },
        {
          step: 1,
          description: "Tổng hiện tại: 2 + 15 = 17. Vì 17 > target (9), ta cần giảm tổng bằng cách dịch con trỏ right sang trái (right = 2).",
          elements: [2, 7, 11, 15],
          highlights: [3],
          pointers: { "left": 0, "right": 2 },
          variables: { "target": 9, "currentSum": 17, "action": "Giảm right" },
          status: "normal"
        },
        {
          step: 2,
          description: "Xét vị trí mới: left = 0 (giá trị 2), right = 2 (giá trị 11). Tổng: 2 + 11 = 13.",
          elements: [2, 7, 11, 15],
          highlights: [0, 2],
          pointers: { "left": 0, "right": 2 },
          variables: { "target": 9, "currentSum": 13, "leftVal": 2, "rightVal": 11 },
          status: "comparing"
        },
        {
          step: 3,
          description: "Tổng 13 vẫn > 9. Tiếp tục dịch con trỏ right sang trái (right = 1).",
          elements: [2, 7, 11, 15],
          highlights: [2],
          pointers: { "left": 0, "right": 1 },
          variables: { "target": 9, "currentSum": 13, "action": "Giảm right" },
          status: "normal"
        },
        {
          step: 4,
          description: "Xét vị trí mới: left = 0 (giá trị 2), right = 1 (giá trị 7). Tổng: 2 + 7 = 9.",
          elements: [2, 7, 11, 15],
          highlights: [0, 1],
          pointers: { "left": 0, "right": 1 },
          variables: { "target": 9, "currentSum": 9, "leftVal": 2, "rightVal": 7 },
          status: "comparing"
        },
        {
          step: 5,
          description: "🎉 Tìm thấy kết quả! Tổng 2 + 7 = 9 bằng đúng target. Trả về cặp chỉ số: [0, 1].",
          elements: [2, 7, 11, 15],
          highlights: [0, 1],
          pointers: { "left": 0, "right": 1 },
          variables: { "target": 9, "result": "[0, 1]", "found": true },
          status: "found"
        }
      ]
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search (Tìm kiếm nhị phân)',
    category: 'Divide and Conquer',
    difficulty: 'Easy',
    description: `Cho một mảng số nguyên 'nums' đã được sắp xếp tăng dần và một giá trị 'target'.
Viết hàm tìm kiếm 'target' trong 'nums'. Nếu tồn tại, trả về chỉ số của nó; ngược lại trả về -1.
Ví dụ: nums = [-1, 0, 3, 5, 9, 12], target = 9 -> Kết quả: index 4.`,
    defaultInput: `nums = [-1, 0, 3, 5, 9, 12]\ntarget = 9`,
    initialResult: {
      problemTitle: "Binary Search (Tìm kiếm nhị phân)",
      problemSummary: "Chia đôi không gian tìm kiếm ở mỗi bước bằng cách so sánh phần tử ở giữa (mid) với target.",
      algorithmName: "Binary Search",
      complexity: {
        time: "O(log n)",
        space: "O(1)"
      },
      dataStructure: "binary_search",
      frames: [
        {
          step: 0,
          description: "Khởi tạo phạm vi tìm kiếm: low = 0, high = 5. Target = 9.",
          elements: [-1, 0, 3, 5, 9, 12],
          highlights: [0, 5],
          pointers: { "low": 0, "high": 5 },
          variables: { "low": 0, "high": 5, "target": 9 },
          status: "normal"
        },
        {
          step: 1,
          description: "Tính mid = (0 + 5) / 2 = 2. Phần tử nums[2] = 3. So sánh 3 với target (9).",
          elements: [-1, 0, 3, 5, 9, 12],
          highlights: [2],
          pointers: { "low": 0, "mid": 2, "high": 5 },
          variables: { "midVal": 3, "target": 9, "compare": "3 < 9" },
          status: "comparing"
        },
        {
          step: 2,
          description: "Vì 3 < 9, target chắc chắn nằm ở nửa bên phải. Thu hẹp phạm vi: low = mid + 1 = 3.",
          elements: [-1, 0, 3, 5, 9, 12],
          highlights: [3, 4, 5],
          pointers: { "low": 3, "high": 5 },
          variables: { "low": 3, "high": 5, "target": 9 },
          status: "normal"
        },
        {
          step: 3,
          description: "Tính mid mới = (3 + 5) / 2 = 4. Phần tử nums[4] = 9. So sánh với target (9).",
          elements: [-1, 0, 3, 5, 9, 12],
          highlights: [4],
          pointers: { "low": 3, "mid": 4, "high": 5 },
          variables: { "midVal": 9, "target": 9, "compare": "9 == 9" },
          status: "comparing"
        },
        {
          step: 4,
          description: "🎯 Tìm thấy target = 9 tại vị trí index 4! Thuật toán kết thúc thành công.",
          elements: [-1, 0, 3, 5, 9, 12],
          highlights: [4],
          pointers: { "mid": 4 },
          variables: { "foundIndex": 4, "target": 9, "found": true },
          status: "found"
        }
      ]
    }
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort (Sắp xếp nổi bọt)',
    category: 'Sorting',
    difficulty: 'Easy',
    description: `Mô phỏng thuật toán Bubble Sort sắp xếp mảng các số nguyên theo thứ tự tăng dần bằng cách liên tục so sánh hai phần tử liền kề và đổi chỗ nếu chúng sai thứ tự.
Ví dụ: [5, 1, 4, 2] -> [1, 2, 4, 5].`,
    defaultInput: `arr = [5, 1, 4, 2]`,
    initialResult: {
      problemTitle: "Bubble Sort (Sắp xếp nổi bọt)",
      problemSummary: "So sánh cặp phần tử kề nhau, đưa phần tử lớn nhất dần về cuối mảng sau mỗi lượt duyệt.",
      algorithmName: "Bubble Sort",
      complexity: {
        time: "O(n²)",
        space: "O(1)"
      },
      dataStructure: "array",
      frames: [
        {
          step: 0,
          description: "Mảng ban đầu [5, 1, 4, 2]. Bắt đầu lượt duyệt thứ nhất.",
          elements: [5, 1, 4, 2],
          highlights: [0, 1],
          pointers: { "i": 0, "j": 1 },
          variables: { "round": 1 },
          status: "comparing"
        },
        {
          step: 1,
          description: "So sánh arr[0] = 5 và arr[1] = 1. Vì 5 > 1 nên hoán đổi vị trí!",
          elements: [1, 5, 4, 2],
          highlights: [0, 1],
          pointers: { "i": 0, "j": 1 },
          variables: { "swapped": true },
          status: "swapping"
        },
        {
          step: 2,
          description: "Tiếp tục so sánh arr[1] = 5 và arr[2] = 4. Vì 5 > 4 nên hoán đổi!",
          elements: [1, 4, 5, 2],
          highlights: [1, 2],
          pointers: { "i": 1, "j": 2 },
          variables: { "swapped": true },
          status: "swapping"
        },
        {
          step: 3,
          description: "Tiếp tục so sánh arr[2] = 5 và arr[3] = 2. Vì 5 > 2 nên hoán đổi!",
          elements: [1, 4, 2, 5],
          highlights: [2, 3],
          pointers: { "i": 2, "j": 3 },
          variables: { "swapped": true },
          status: "swapping"
        },
        {
          step: 4,
          description: "Kết thúc lượt 1: Số 5 (lớn nhất) đã 'nổi' về cuối mảng. Bắt đầu lượt 2 so sánh [1, 4, 2, 5].",
          elements: [1, 4, 2, 5],
          highlights: [1, 2],
          pointers: { "i": 1, "j": 2 },
          variables: { "round": 2 },
          status: "comparing"
        },
        {
          step: 5,
          description: "So sánh arr[1] = 4 và arr[2] = 2. Vì 4 > 2 nên hoán đổi!",
          elements: [1, 2, 4, 5],
          highlights: [1, 2],
          pointers: { "i": 1, "j": 2 },
          variables: { "swapped": true },
          status: "swapping"
        },
        {
          step: 6,
          description: "🎉 Mảng đã được sắp xếp hoàn chỉnh thành [1, 2, 4, 5]!",
          elements: [1, 2, 4, 5],
          highlights: [0, 1, 2, 3],
          variables: { "sorted": true },
          status: "done"
        }
      ]
    }
  }
];
