from pathlib import Path
import hashlib,json,shutil,os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(os.environ['CAPYBARA_SOURCE']) if 'CAPYBARA_SOURCE' in os.environ else None
SELECTIONS=[
('Front cover','5198c57e-2d5f-4d63-92f3-dab0ba4609de'),
('Bedroom','21bea776-8542-438f-aaab-2e372621bd56'),
('Closet & tea','d86a5c7b-a769-4131-8998-7ec27d35f315'),
('Lake','073b25d1-ae56-4a66-9031-ea9f404101d1'),
('Art easel','c3a7db6c-c825-4d16-8e9e-16909c4cfe57'),
('Salon','00304a69-2087-4f0a-bab9-77edc009eebb'),
('Game board','06390638-8e11-497a-aa8d-fabc932ebce0'),
('Toca-style dress-up','b5f1144b-d6a1-4e42-8d62-fb83dd3a98cc'),
('Gacha Capybara','6d9ff2ee-0255-46bb-a6e1-37eb5dcad57c'),
('Back cover','831feb50-d720-4fb9-b9c6-d15f53bfa0b5')]
manifest=[]
for i,(title,uid) in enumerate(SELECTIONS):
 original=SOURCE/f'exec-{uid}.png' if SOURCE else None;dest=ROOT/f'assets/page-{i:02}.png'
 if original and original.exists(): shutil.copyfile(original,dest)
 with Image.open(dest) as im: width,height=im.size
 manifest.append(dict(title=title,src=f'assets/page-{i:02}.png',source=f'exec-{uid}.png',width=width,height=height,sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
(ROOT/'assets/pages.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'pages.js').write_text('window.BOOK_PAGES = '+json.dumps(manifest,indent=2)+';\n')
pdf=ROOT/'output/pdf/capybara-playbook.pdf'
c=canvas.Canvas(str(pdf),pagesize=(600,720),pageCompression=1)
c.setTitle('Capybara Playbook');c.setAuthor('Capybara Playbook');c.setSubject('The complete ten-page illustrated book')
for i,page in enumerate(manifest):
 c.bookmarkPage(str(i));c.addOutlineEntry(page['title'],str(i),0)
 c.drawImage(ImageReader(str(ROOT/page['src'])),0,0,width=600,height=720)
 c.showPage()
c.save()
print(f'Assembled {len(manifest)} original images; PDF: {pdf}')
