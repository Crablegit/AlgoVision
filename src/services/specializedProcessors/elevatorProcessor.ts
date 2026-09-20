import { SimulationResult, Frame, BuildingData, BuildingFloor, ElevatorButton } from '../../types';

/**
 * Bộ xử lý chuyên biệt cho bài toán Thang máy / ELEVATOR II
 * Đề bài: Tòa nhà cao h tầng (từ 1 đến h). Thang máy xuất phát từ tầng 1.
 * Có 4 nút bấm: +a tầng, +b tầng, +c tầng, và trở về tầng 1.
 * Nếu bấm nút làm thang vượt quá h thì không thể bấm.
 * Đếm số lượng tầng phân biệt có thể tới được.
 */
export function processElevator(sim: SimulationResult, expectedOutput?: string): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const tokens = rawInput.split(/\s+/).map(Number).filter(v => !isNaN(v));

  let h = 15;
  let a = 4;
  let b = 7;
  let c = 9;

  if (tokens.length >= 4) {
    h = tokens[0];
    a = tokens[1];
    b = tokens[2];
    c = tokens[3];
  }

  // Thuật toán BFS tìm tập các tầng có thể tới
  const visited = new Set<number>([1]);
  const queue: number[] = [1];

  interface TransitionRecord {
    from: number;
    to: number;
    step: number;
    btnLabel: string;
  }

  const transitions: TransitionRecord[] = [];
  const buttonsList = [
    { label: `+${a}`, step: a },
    { label: `+${b}`, step: b },
    { label: `+${c}`, step: c }
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const btn of buttonsList) {
      const nxt = curr + btn.step;
      if (nxt <= h && !visited.has(nxt)) {
        visited.add(nxt);
        queue.push(nxt);
        transitions.push({
          from: curr,
          to: nxt,
          step: btn.step,
          btnLabel: btn.label
        });
      }
    }
  }

  const totalDistinctFloors = visited.size;
  const calculatedOutput = String(totalDistinctFloors);

  // Sinh các Frame trực quan hóa từng bước
  const frames: Frame[] = [];
  let stepIdx = 0;

  const makeButtons = (activeStep?: number, isResetActive?: boolean): ElevatorButton[] => {
    return [
      { label: `+${a}`, step: a, type: 'up', isActive: activeStep === a },
      { label: `+${b}`, step: b, type: 'up', isActive: activeStep === b },
      { label: `+${c}`, step: c, type: 'up', isActive: activeStep === c },
      { label: 'Về 1', step: 0, type: 'reset', isActive: isResetActive === true }
    ];
  };

  const currentVisitedFloors: number[] = [1];

  // Frame 0: Trạng thái ban đầu
  frames.push({
    step: stepIdx++,
    title: 'Khởi tạo tòa nhà & thang máy',
    description: `Khởi tạo tòa nhà cao h = ${h} tầng (từ tầng 1 đến tầng ${h}). Thang máy bắt đầu tại tầng 1. Có 4 nút bấm: +${a}, +${b}, +${c}, và Trở về tầng 1. Đã tới: {1}.`,
    buildingData: {
      totalFloors: h,
      minFloor: 1,
      currentFloor: 1,
      visitedFloors: [...currentVisitedFloors],
      buttons: makeButtons(),
      totalReached: 1,
      elevator: {
        currentFloor: 1,
        status: 'idle'
      }
    },
    variables: {
      'chiều_cao_h': h,
      'nút_a': `+${a}`,
      'nút_b': `+${b}`,
      'nút_c': `+${c}`,
      'tầng_hiện_tại': 1,
      'số_tầng_đã_đến': 1
    }
  });

  // Từng bước chuyển tầng
  for (const tr of transitions) {
    currentVisitedFloors.push(tr.to);
    frames.push({
      step: stepIdx++,
      title: `Bấm nút ${tr.btnLabel}`,
      description: `Bấm nút ${tr.btnLabel}: Thang máy di chuyển từ tầng ${tr.from} lên tầng ${tr.to} (${tr.from} + ${tr.step} = ${tr.to} <= ${h}). Tầng ${tr.to} được đánh dấu đã đến! Tổng số tầng đã đến: ${currentVisitedFloors.length}.`,
      buildingData: {
        totalFloors: h,
        minFloor: 1,
        currentFloor: tr.to,
        visitedFloors: [...currentVisitedFloors],
        buttons: makeButtons(tr.step, false),
        totalReached: currentVisitedFloors.length,
        elevator: {
          currentFloor: tr.to,
          previousFloor: tr.from,
          buttonPressed: tr.btnLabel,
          status: 'reached'
        }
      },
      variables: {
        'nút_vừa_bấm': tr.btnLabel,
        'từ_tầng': tr.from,
        'lên_tầng': tr.to,
        'tầng_hiện_tại': tr.to,
        'số_tầng_đã_đến': currentVisitedFloors.length
      }
    });
  }

  // Frame kết luận
  const sortedFloors = Array.from(visited).sort((x, y) => x - y);
  frames.push({
    step: stepIdx++,
    title: 'Kết luận & Kết quả',
    description: `Hoàn tất kiểm tra tất cả các tầng có thể tới. Từ các tầng này, nếu bấm tiếp bất kỳ nút nào (+${a}, +${b}, +${c}) cũng sẽ vượt quá tầng ${h} hoặc quay lại tầng đã đến. Kết quả: có đúng ${totalDistinctFloors} tầng phân biệt có thể tới là {${sortedFloors.join(', ')}}. Output = ${totalDistinctFloors}.`,
    buildingData: {
      totalFloors: h,
      minFloor: 1,
      currentFloor: sortedFloors[sortedFloors.length - 1],
      visitedFloors: sortedFloors,
      buttons: makeButtons(),
      totalReached: totalDistinctFloors,
      elevator: {
        currentFloor: sortedFloors[sortedFloors.length - 1],
        status: 'idle'
      }
    },
    variables: {
      'tổng_số_tầng_đến_được': totalDistinctFloors,
      'danh_sách_tầng': sortedFloors.join(', ')
    },
    outputContribution: calculatedOutput
  });

  return {
    ...sim,
    viewType: 'building',
    subType: 'elevator',
    sampleOutput: calculatedOutput,
    frames
  };
}
