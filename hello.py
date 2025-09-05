from fastapi import FastAPI

app = FastAPI()

@app.get("/health") 
def health(): 
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "Hello World Test"}

if __name__ == "__main__":
    print("🚀 Hello World Test Server hazır!")

