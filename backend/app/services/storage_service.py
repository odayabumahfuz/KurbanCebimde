import os
import time
import mimetypes
from typing import Optional

import boto3
from botocore.client import Config

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "video/mp4"}

class StorageService:
    def __init__(self):
        self.bucket = os.getenv("S3_BUCKET")
        self.region = os.getenv("S3_REGION", "auto")
        self.base_url = os.getenv("S3_BASE_URL")  # optional CDN/base url
        self.expire_seconds = int(os.getenv("PRESIGN_EXPIRE_SEC", "900"))
        self.s3 = boto3.client(
            "s3",
            region_name=self.region if self.region != "auto" else None,
            endpoint_url=os.getenv("S3_ENDPOINT_URL"),  # R2/AWS compatible
            aws_access_key_id=os.getenv("S3_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
            config=Config(signature_version="s3v4"),
        )

    def _validate_mime(self, mime_type: str) -> None:
        if mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError("Unsupported mime type")

    def _guess_disposition(self, key: str) -> str:
        filename = key.split("/")[-1]
        return f"attachment; filename*=UTF-8''{filename}"

    def presign_put(self, key: str, mime_type: str, size_bytes: Optional[int] = None) -> str:
        self._validate_mime(mime_type)
        extra = {"ContentType": mime_type}
        if size_bytes is not None:
            # optional content-length-range policy is not directly enforced here
            pass
        return self.s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ContentType": mime_type,
            },
            ExpiresIn=self.expire_seconds,
        )

    def presign_get(self, key: str, mime_type: Optional[str] = None) -> str:
        content_type = mime_type or mimetypes.guess_type(key)[0] or "application/octet-stream"
        return self.s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ResponseContentType": content_type,
                "ResponseContentDisposition": self._guess_disposition(key),
            },
            ExpiresIn=self.expire_seconds,
        )

storage_service = StorageService()
