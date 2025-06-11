# ASL Model Directory

Place your pretrained ASL recognition model files here:

## Supported Formats:
- **TensorFlow.js**: `asl_model.json` + `asl_model_weights.bin`
- **Keras H5**: Convert to TensorFlow.js format using `tensorflowjs_converter`

## Model Requirements:
- Input: Hand landmark features (63 features from 21 landmarks × 3 coordinates)
- Output: 26 classes (A-Z letters)
- Recommended input shape: [batch_size, 73] (63 landmark features + 10 distance features)

## Creating Your Own Model:

### Option 1: Use Teachable Machine
1. Go to https://teachablemachine.withgoogle.com/
2. Create a new "Image Project"
3. Add classes for each ASL letter (A-Z)
4. Upload training images for each letter
5. Train the model
6. Export as "TensorFlow.js"
7. Place the files in this directory

### Option 2: Convert Existing Keras Model
```bash
# Install tensorflowjs converter
pip install tensorflowjs

# Convert your .h5 model
tensorflowjs_converter --input_format=keras \
                       your_model.h5 \
                       ./public/models/
```

### Option 3: Train Custom Model
Use the landmark features extracted by MediaPipe Hands:
- 21 hand landmarks × 3 coordinates (x, y, z) = 63 features
- Additional distance features between key points = 10 features
- Total input features = 73

## Current Implementation:
The app currently uses heuristic-based classification as a fallback when no model is found. Replace with your trained model for better accuracy.

## Model Performance Tips:
- Ensure good lighting when collecting training data
- Include diverse hand positions and backgrounds
- Use data augmentation for better generalization
- Consider using transfer learning from existing hand gesture models