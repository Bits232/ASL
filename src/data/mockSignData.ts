// Mock data for sign language alphabet recognition
// In a real application, this would be replaced with ML model predictions
export const mockSignData = {
  'A': { video: '/signs/a.mp4', description: 'Closed fist with thumb resting on the side' },
  'B': { video: '/signs/b.mp4', description: 'Flat hand with fingers together and thumb tucked' },
  'C': { video: '/signs/c.mp4', description: 'Curved hand in the shape of a C' },
  'D': { video: '/signs/d.mp4', description: 'Index finger pointing up, other fingers curled' },
  'E': { video: '/signs/e.mp4', description: 'Curled fingers, thumb tucked' },
  'F': { video: '/signs/f.mp4', description: 'Thumb and index finger form circle, other fingers up' },
  'G': { video: '/signs/g.mp4', description: 'Hand flat, thumb and index extended in L shape' },
  'H': { video: '/signs/h.mp4', description: 'Index and middle finger extended together' },
  'I': { video: '/signs/i.mp4', description: 'Pinky finger extended, other fingers curled' },
  'J': { video: '/signs/j.mp4', description: 'Pinky extended, hand draws J in air' },
  'K': { video: '/signs/k.mp4', description: 'Index and middle finger form V with thumb' },
  'L': { video: '/signs/l.mp4', description: 'Index finger and thumb extended in L shape' },
  'M': { video: '/signs/m.mp4', description: 'Three fingers resting over thumb' },
  'N': { video: '/signs/n.mp4', description: 'Two fingers resting over thumb' },
  'O': { video: '/signs/o.mp4', description: 'Fingers and thumb form circle' },
  'P': { video: '/signs/p.mp4', description: 'Hand points down with middle finger touching thumb' },
  'Q': { video: '/signs/q.mp4', description: 'Hand points down with ring finger touching thumb' },
  'R': { video: '/signs/r.mp4', description: 'Crossed index and middle finger' },
  'S': { video: '/signs/s.mp4', description: 'Closed fist with thumb over fingers' },
  'T': { video: '/signs/t.mp4', description: 'Thumb between index and middle finger' },
  'U': { video: '/signs/u.mp4', description: 'Index and middle finger extended together' },
  'V': { video: '/signs/v.mp4', description: 'Index and middle finger in V shape' },
  'W': { video: '/signs/w.mp4', description: 'Index, middle, and ring finger extended' },
  'X': { video: '/signs/x.mp4', description: 'Index finger bent at middle joint' },
  'Y': { video: '/signs/y.mp4', description: 'Thumb and pinky extended, other fingers curled' },
  'Z': { video: '/signs/z.mp4', description: 'Index finger draws Z in air' },
};

// Predefined sequences that represent actual ASL signs for common letters
const aslSequences = {
  'A': { pattern: 'closed_fist_thumb_side', confidence: 0.85 },
  'B': { pattern: 'flat_hand_fingers_together', confidence: 0.90 },
  'C': { pattern: 'curved_c_shape', confidence: 0.88 },
  'D': { pattern: 'index_up_others_curled', confidence: 0.87 },
  'E': { pattern: 'fingers_curled_thumb_tucked', confidence: 0.83 },
  'F': { pattern: 'ok_sign_other_fingers_up', confidence: 0.89 },
  'G': { pattern: 'index_thumb_pointing', confidence: 0.86 },
  'H': { pattern: 'two_fingers_together', confidence: 0.91 },
  'I': { pattern: 'pinky_extended', confidence: 0.84 },
  'L': { pattern: 'l_shape_thumb_index', confidence: 0.92 },
  'O': { pattern: 'circle_all_fingers', confidence: 0.88 },
  'R': { pattern: 'crossed_fingers', confidence: 0.85 },
  'S': { pattern: 'fist_thumb_over', confidence: 0.90 },
  'U': { pattern: 'two_fingers_up', confidence: 0.87 },
  'V': { pattern: 'peace_sign', confidence: 0.93 },
  'Y': { pattern: 'thumb_pinky_extended', confidence: 0.86 },
};

// Function to simulate more realistic sign detection
export const detectSign = (landmarks: any): Promise<{letter: string, confidence: number}> => {
  return new Promise((resolve) => {
    // Simulate processing time for realistic feel
    const delay = Math.random() * 400 + 300; // 300-700ms delay
    
    // Use predefined ASL sequences for more realistic detection
    const availableLetters = Object.keys(aslSequences);
    
    // Simulate that some letters are easier to detect than others
    const easyLetters = ['A', 'B', 'L', 'O', 'V', 'Y']; // Clear, distinct shapes
    const mediumLetters = ['C', 'D', 'F', 'G', 'H', 'I', 'R', 'S', 'U'];
    
    // 60% chance of easy letter, 40% chance of medium letter
    const useEasyLetter = Math.random() < 0.6;
    const letterPool = useEasyLetter ? easyLetters : mediumLetters;
    
    const selectedLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
    const baseConfidence = aslSequences[selectedLetter]?.confidence || 0.8;
    
    // Add some realistic variation to confidence
    const confidenceVariation = (Math.random() - 0.5) * 0.2; // ±0.1 variation
    const finalConfidence = Math.max(0.6, Math.min(0.95, baseConfidence + confidenceVariation));

    setTimeout(() => {
      resolve({ 
        letter: selectedLetter, 
        confidence: finalConfidence 
      });
    }, delay);
  });
};