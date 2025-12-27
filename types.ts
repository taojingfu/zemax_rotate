
export interface Matrix3x4 {
  r11: number; r12: number; r13: number; tx: number;
  r21: number; r22: number; r23: number; ty: number;
  r31: number; r32: number; r33: number; tz: number;
}

export interface DecompositionResult {
  matrix: Matrix3x4;
  eulerDegrees: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  eulerRadians: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  translation: {
    x: number;
    y: number;
    z: number;
  };
}
