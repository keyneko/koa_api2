-- 获取当前日期的年月日
SET @currentDate = CURDATE();
SET @dateCode = CONCAT(YEAR(@currentDate), LPAD(MONTH(@currentDate), 2, '0'), LPAD(DAY(@currentDate), 2, '0'));

INSERT INTO `barcodes` (`value`, `name`, `quantity`, `basicUnit`, `translations`, `createdAt`, `updatedAt`) VALUES
(CONCAT('SJ', @dateCode, '0001'), '圈圈教你玩转USB', 1, '本', '{"name": {"en": "Circle teaches you how to play with USB", "ja": "サークルがUSBで遊ぶ方法を教えます"}, "basicUnit": {"en": "pcs", "ja": "本"}}', NOW(), NOW()),
(CONCAT('SJ', @dateCode, '0002'), 'Koa与Node.js开发实战', 1, '本', '{"name": {"en": "Koa and Node.js development practice", "ja": "KoaとNode.jsの実践的な開発"}, "basicUnit": {"en": "pcs", "ja": "本"}}', NOW(), NOW()),
(CONCAT('SJ', @dateCode, '0003'), 'Node-RED视觉化开发工具', 1, '本', '{"name": {"en": "Node-RED visual development tool", "ja": "Node-REDビジュアル開発ツール"}, "basicUnit": {"en": "pcs", "ja": "本"}}', NOW(), NOW()),
(CONCAT('SJ', @dateCode, '0004'), '前端自动化测试框架Cypress从入门到精通', 1, '本', '{"name": {"en": "Front-end automated testing framework Cypress", "ja": "フロントエンド自動テスト フレームワーク Cypress"}, "basicUnit": {"en": "pcs", "ja": "本"}}', NOW(), NOW()),
(CONCAT('SJ', @dateCode, '0005'), '8051软核处理设计实战', 1, '本', '{"name": {"en": "8051 soft core processing design practice", "ja": "8051 ソフトコア処理の設計実践"}, "basicUnit": {"en": "pcs", "ja": "本"}}', NOW(), NOW()),
(CONCAT('WJ', @dateCode, '0001'), '超级飞侠乐迪手办', 1, '只', '{"name": {"en": "Super Wings Reddy figure", "ja": "スーパーウイングス レディ フィギュア"}, "basicUnit": {"en": "pcs", "ja": "枚"}}', NOW(), NOW());
