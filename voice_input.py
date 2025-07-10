import speech_recognition as sr

def get_voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Listening... Please ask your question.")
        try:
            recognizer.pause_threshold = 2
            recognizer.energy_threshold = 300
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=20)
            user_query = recognizer.recognize_google(audio)
            print(f"🗣️ You said: {user_query}")
            return user_query
        except sr.WaitTimeoutError:
            print("⌛ Timeout: No speech detected.")
        except sr.UnknownValueError:
            print("😕 Sorry, I couldn't understand the audio.")
        except sr.RequestError as e:
            print(f"❌ API error: {e}")
    return None
