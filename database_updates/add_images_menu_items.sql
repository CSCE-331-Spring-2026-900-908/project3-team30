ALTER TABLE menu_items
ADD COLUMN image_url TEXT;

UPDATE menu_items
SET image_url = 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/6/13/boba-milk-tea.jpg.rend.hgtvcom.1280.1280.85.suffix/1686684207354.webp';
