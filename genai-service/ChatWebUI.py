import requests

class ChatWebUI:
    def __init__(self, api_url: str, api_key: str, model: str = "llama3.3:latest"):
        self.api_url = api_url
        self.api_key = api_key
        self.model = model

    def run(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post(self.api_url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]