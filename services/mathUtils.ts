
import { Matrix3x4, DecompositionResult } from '../types';

export const parseMatrixString = (input: string): Matrix3x4 | null => {
  // Cleans the string and extracts numbers
  // Supports formats like "9: 1.0 0.0 ..." or just space separated numbers
  const cleaned = input.replace(/^9:\s*/, '').trim();
  const parts = cleaned.split(/[\s,]+/).map(Number);

  if (parts.length !== 12 || parts.some(isNaN)) {
    return null;
  }

  return {
    r11: parts[0], r12: parts[1], r13: parts[2], tx: parts[3],
    r21: parts[4], r22: parts[5], r23: parts[6], ty: parts[7],
    r31: parts[8], r32: parts[9], r33: parts[10], tz: parts[11]
  };
};

export const decomposeMatrix = (m: Matrix3x4): DecompositionResult => {
  /**
   * Decomposition for standard ZYX Euler sequence (Tait-Bryan)
   * Pitch = atan2(-r31, sqrt(r32^2 + r33^2))
   * Roll = atan2(r32, r33)
   * Yaw = atan2(r21, r11)
   */
  
  const pitch = Math.atan2(-m.r31, Math.sqrt(m.r32 * m.r32 + m.r33 * m.r33));
  const roll = Math.atan2(m.r32, m.r33);
  const yaw = Math.atan2(m.r21, m.r11);

  const radToDeg = (rad: number) => (rad * 180) / Math.PI;

  return {
    matrix: m,
    eulerRadians: { roll, pitch, yaw },
    eulerDegrees: {
      roll: radToDeg(roll),
      pitch: radToDeg(pitch),
      yaw: radToDeg(yaw)
    },
    translation: {
      x: m.tx,
      y: m.ty,
      z: m.tz
    }
  };
};

export const formatPrecision = (val: number, decimals: number = 10): string => {
  // Using fixed to ensure requested precision
  return val.toFixed(decimals);
};
