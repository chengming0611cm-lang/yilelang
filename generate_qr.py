import qrcode
from PIL import Image

import sys

url = sys.argv[1] if len(sys.argv) > 1 else "http://10.6.201.183:3000"

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=2,
)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="#0A0D12", back_color="white")
img.save("D:\\AI\\cunchu\\za\\one\\qrcode.png")
print("二维码已生成: qrcode.png")
