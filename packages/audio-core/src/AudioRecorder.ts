export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    
    async start(
        onChunk: (chunk: Blob) => void
    ){
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
            if(event.data.size > 0){
                onChunk(event.data);
            }

        }

        this.mediaRecorder?.start(100);

    }
    stop(){
        this.mediaRecorder?.stop();
    }
}