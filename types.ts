
export enum FlowType {
  ANALYSIS = 'ANALYSIS',
  IDEAS = 'IDEAS',
  HASHTAGS = 'HASHTAGS'
}

export interface ViralMetrics {
  score: number;
  hookStrength: number;
  replayTrigger: number;
  commentBait: number;
  distributionPotential: number;
  algorithmFit: number;
}
