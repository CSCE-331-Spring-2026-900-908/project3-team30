ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE menu_items SET image_url = '/images/BlackTea.png'       WHERE name = 'Small Black Milk Tea';
UPDATE menu_items SET image_url = '/images/BlackTea.png'       WHERE name = 'Large Black Milk Tea';

UPDATE menu_items SET image_url = '/images/GreenMilkTea.png'   WHERE name = 'Small Green Milk Tea';
UPDATE menu_items SET image_url = '/images/GreenMilkTea.png'   WHERE name = 'Large Green Milk Tea';

UPDATE menu_items SET image_url = '/images/OolongMilkTea.png'  WHERE name = 'Small Oolong Milk Tea';
UPDATE menu_items SET image_url = '/images/OolongMilkTea.png'  WHERE name = 'Large Oolong Milk Tea';

UPDATE menu_items SET image_url = '/images/ThaiMilkTea.png'    WHERE name = 'Small Thai Milk Tea';
UPDATE menu_items SET image_url = '/images/ThaiMilkTea.png'    WHERE name = 'Large Thai Milk Tea';

UPDATE menu_items SET image_url = '/images/TaroMilkTea.png'    WHERE name = 'Small Taro Milk Tea';
UPDATE menu_items SET image_url = '/images/TaroMilkTea.png'    WHERE name = 'Large Taro Milk Tea';

UPDATE menu_items SET image_url = '/images/BlackTea.png'       WHERE name = 'Small Black Tea';
UPDATE menu_items SET image_url = '/images/BlackTea.png'       WHERE name = 'Large Black Tea';

UPDATE menu_items SET image_url = '/images/GreenTea.png'       WHERE name = 'Small Green Tea';
UPDATE menu_items SET image_url = '/images/GreenTea.png'       WHERE name = 'Large Green Tea';

UPDATE menu_items SET image_url = '/images/OolongTea.png'      WHERE name = 'Small Oolong Tea';
UPDATE menu_items SET image_url = '/images/OolongTea.png'      WHERE name = 'Large Oolong Tea';

UPDATE menu_items SET image_url = '/images/MangoGreenTea.png'      WHERE name = 'Small Mango Green Tea';
UPDATE menu_items SET image_url = '/images/MangoGreenTea.png'      WHERE name = 'Large Mango Green Tea';

UPDATE menu_items SET image_url = '/images/StrawberryGreenTea.png' WHERE name = 'Small Strawberry Green Tea';
UPDATE menu_items SET image_url = '/images/StrawberryGreenTea.png' WHERE name = 'Large Strawberry Green Tea';

UPDATE menu_items SET image_url = '/images/LycheeGreenTea.png'     WHERE name = 'Small Lychee Green Tea';
UPDATE menu_items SET image_url = '/images/LycheeGreenTea.png'     WHERE name = 'Large Lychee Green Tea';

UPDATE menu_items SET image_url = '/images/PeachGreenTea.png'      WHERE name = 'Small Peach Green Tea';
UPDATE menu_items SET image_url = '/images/PeachGreenTea.png'      WHERE name = 'Large Peach Green Tea';