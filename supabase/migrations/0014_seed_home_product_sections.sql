-- Homepage taxonomy for the product sections shown below "تصفح حسب الخصم"
insert into public.store_brands (name_ar,name_en,slug,is_active)
values ('امباور نيوتريشن','Empower Nutrition','empower-nutrition',true)
on conflict (slug) do update
set name_ar=excluded.name_ar,name_en=excluded.name_en,is_active=true,updated_at=now();

insert into public.store_categories (name_ar,name_en,slug,is_active,sort_order)
values
 ('الكومبوهات الأكثر مبيعًا','Best Selling Combos','best-selling-combos',true,70),
 ('قبل التمرين','Pre Workout','pre-workout',true,80),
 ('فيتامين','Vitamins','vitamins',true,90),
 ('البروتينات','Proteins','proteins',true,100),
 ('الأحماض الأمينية','Amino Acids','amino-acids',true,110),
 ('سناك بروتين','Protein Snacks','protein-snacks',true,120)
on conflict (slug) do update
set name_ar=excluded.name_ar,name_en=excluded.name_en,is_active=true,sort_order=excluded.sort_order,updated_at=now();
