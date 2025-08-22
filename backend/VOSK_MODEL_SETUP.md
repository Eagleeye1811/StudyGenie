# Vosk Speech Recognition Model Setup Instructions

To enable speech-to-text functionality in Study Genie, you need to download and install the Vosk speech recognition model.

## Instructions:

1. Visit the Vosk model download page: https://alphacephei.com/vosk/models

2. Download the English US model (vosk-model-en-us-0.22). It's a large file (1.8GB):

   - Direct link: https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip

3. Extract the downloaded ZIP file

4. Move the extracted folder (named "vosk-model-en-us-0.22") to:

   ```
   C:\Users\adity\Desktop\Projects\StudyGenie\StudyGenie\backend\
   ```

   (The model should be at the same level as the "app" folder)

5. Restart your backend server

## Alternative smaller models:

If the US English model is too large, you can use a smaller model:

- Small English model (43MB): https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

Update the MODEL_PATH in `app/services/stt_service.py` to match the name of the model folder you download.
