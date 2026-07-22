# -*- coding: utf-8 -*-
import json
import urllib.request
import urllib.error
import os
import sys

API_KEY = os.environ.get("OPENAI_API_KEY", "")

print("Starting OpenAI verification and dataset enrichment script...")

def call_openai(prompt_text):
    if not API_KEY:
        print("No OPENAI_API_KEY found in environment.")
        return None
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a professional linguist specializing in Turkish, Arabic, and English language pedagogy. Output strictly valid JSON."},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            content = res_json["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"OpenAI API call error: {e}")
        return None

if __name__ == "__main__":
    test_res = call_openai("Provide 3 authentic A1 Turkish words with English and Arabic translations in JSON key 'words'.")
    if test_res:
        print("OpenAI API test call successful!")
        print(json.dumps(test_res, ensure_ascii=False, indent=2))
    else:
        print("OpenAI API test call skipped or failed.")
