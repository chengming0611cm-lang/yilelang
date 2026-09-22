# -*- coding: utf-8 -*-
import fitz  # PyMuPDF
import os

path = r"D:\Download\cunchu\za\本体驱动的AI数据管理 A5.pdf"
outpath = os.path.join(r"D:\Download\cunchu\za", "book2_Benti.txt")

doc = fitz.open(path)
total_pages = len(doc)
print(f"总页数: {total_pages}")

# 先测试前几页文本
has_text = 0
for i in range(min(10, total_pages)):
    t = doc[i].get_text()
    if t.strip():
        has_text += 1
print(f"前10页有文本的页数: {has_text}")

# 提取所有有文本的页面
sample_indices = list(range(0, 15)) + list(range(15, 50)) + list(range(50, 100)) + list(range(100, 180)) + list(range(180, 260)) + list(range(260, total_pages))

with open(outpath, "w", encoding="utf-8") as f:
    f.write(f"=== 本体驱动的AI数据管理 总页数:{total_pages} ===\n")
    found = 0
    for i in sample_indices:
        if i >= total_pages:
            break
        try:
            text = doc[i].get_text()
        except Exception as e:
            text = ""
        if text and text.strip():
            f.write(f"\n--- 第 {i+1} 页 ---\n")
            f.write(text)
            f.write("\n")
            found += 1
print(f"提取到有文本的页面数: {found}")
doc.close()
