# generate_surah_links.py
links_html = ""

with open("surah_pages.txt", "r", encoding="utf-8") as f:
    for line in f:
        if "->" in line:
            name, pg = line.split("->")
            name = name.strip()
            pg = pg.strip()
            if pg.isdigit():  # only add if page number is valid
                links_html += f'<a href="quran_with_nav.pdf#page={pg}" target="pdf">{name}</a>\n'

# Save result
with open("surah_links.html", "w", encoding="utf-8") as f:
    f.write(links_html)

print("✅ Done! Surah links saved in surah_links.html")
