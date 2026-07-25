import { SyllabusData } from '../types';
import { gs1Data } from './papers/gs1Data';
import { gs2Data } from './papers/gs2Data';
import { gs3Data } from './papers/gs3Data';
import { gs4Data } from './papers/gs4Data';
import { essayData } from './papers/essayData';
import { optionalData } from './papers/optionalData';

export const INITIAL_SYLLABUS_DATA: SyllabusData = [
  gs1Data,
  gs2Data,
  gs3Data,
  gs4Data,
  essayData,
  optionalData
];
