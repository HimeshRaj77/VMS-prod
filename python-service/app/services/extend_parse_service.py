import os
from extend_ai import Extend
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

client = Extend(token=os.getenv("EXTEND_API_KEY"))


class ExtendParseService:

    @staticmethod
    async def parse_document(file: UploadFile) -> str:
        uploaded = client.files.upload(
            file=file.file
        )

        response = client.parse(
            file={
                "id": uploaded.id
            }
        )

        texts = []

        if response.output and response.output.chunks:
            for chunk in response.output.chunks:
                if chunk.content:
                    texts.append(chunk.content)

        return "\n\n".join(texts)
