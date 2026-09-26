insert into public.store_categories (name_ar,name_en,slug,description_ar,description_en,is_active,sort_order)
values
('مكملات الرياضيين','Athlete Supplements','supplements','مكملات مختارة للرياضيين والأداء البدني','Supplements for athletes and performance',true,10),
('الجمال والعناية','Beauty & Care','beauty','منتجات العناية والجمال','Beauty and personal care products',true,20),
('التحكم في الوزن','Weight Control','weight-control','منتجات تساعد على نمط حياة متوازن','Products for a balanced lifestyle',true,30),
('الصحة والعافية','Health & Wellness','health-wellness','منتجات الصحة والعافية اليومية','Everyday health and wellness products',true,40),
('الأغذية الصحية','Healthy Food','healthy-food','خيارات غذائية صحية','Healthy food choices',true,50),
('معدات رياضية','Sports Equipment','sports-equipment','معدات وأدوات للتمارين الرياضية','Sports and workout equipment',true,60)
on conflict (slug) do update set name_ar=excluded.name_ar,name_en=excluded.name_en,description_ar=excluded.description_ar,description_en=excluded.description_en,is_active=true,sort_order=excluded.sort_order;