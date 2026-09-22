# -*- coding: utf-8 -*-
import fitz
import os

path = r"D:\Download\cunchu\za\本体驱动的AI数据管理 A5.pdf"
imgdir = os.path.join(r"D:\Download\cunchu\za", "benti_imgs")
os.makedirs(imgdir, exist_ok=True)

doc = fitz.open(path)
# 关键页面：封面、版权、目录、前言、各章首页采样
pages_to_convert = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 30, 50, 80, 120, 160, 200, 250, 300, 340]
pages_to_convert = [p for p in pages_to_convert if p < len(doc)]

for i in pages_to_convert:
    page = doc[i]
    # 用较低DPI保证速度，但够看清文字
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    outpath = os.path.join(imgdir, f"page_{i+1:03d}.png")
    pix.save(outpath)
    print(f"已保存第{i+1}页 -> {outpath}")
doc.close()
print("完成")
