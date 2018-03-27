/* This view basically makes a list with all the field permuations (e.g. Extant Plants) on one line per quad*/


create view eo_quads_union_vw as

with total_list as (
select a.quad_name, 'a' as a_cnt, NULL as b_cnt, NULL as c_cnt, NULL as d_cnt, NULL as e_cnt, NULL as f_cnt, NULL as g_cnt,
NULL as h_cnt, NULL as i_cnt, null as j_cnt, NULL as k_cnt, NULL as l_cnt
from eo_quads_vw a
union all
select b.quad_name, NULL, 'b', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL  from eo_quads_vw b where b.taxonomy = 'Animals'
union all
select c.quad_name, NULL, NULL, 'c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL from eo_quads_vw c where c.taxonomy = 'Plants'
union all
select d.quad_name, NULL, NULL, NULL, 'd', NULL, NULL, NULL, NULL, NULL, NULL, NUll, NULL  from eo_quads_vw d where d.taxonomy = 'Community'
union all
select e.quad_name, NULL, NULL, NULL, NULL, 'e', NULL, NULL, NULL, NULL, NULL, NULL, NULL from eo_quads_vw e where e.rankstatus = 'Extant'
union all
select f.quad_name, NULL, NULL, NULL, NULL, NULL, 'f', NULL, NULL, NULL, NULL, NULL, NULL   from eo_quads_vw f where f.rankstatus = 'Historic/Extirpated'
union all
select g.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, 'g', NULL, NULL, NULL, NULL, NULL from eo_quads_vw g 
where g.rankstatus = 'Extant' and g.taxonomy = 'Animals'
union all
select h.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'h', NULL, NULL, NULL, NULL from eo_quads_vw h where h.rankstatus = 'Historic/Extirpated'
and h.taxonomy = 'Animals'
union all 
select i.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'i', NULL, NULL, NULL from eo_quads_vw i where i.rankstatus = 'Extant' 
and i.taxonomy = 'Plants'
union all
select j.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'j', NULL, NULL from eo_quads_vw j where j.rankstatus = 'Historic/Extirpated'
and j.taxonomy = 'Plants'
union all
select k.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'k', NULL from eo_quads_vw k where k.rankstatus = 'Extant'
and k.taxonomy = 'Community'
union all
select l.quad_name, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'l' from eo_quads_vw l where l.rankstatus = 'Historic/Extirpated'
and l.taxonomy = 'Community'

)
select quad_name, count(a_cnt) as "allRecords", count(b_cnt) as "Animals", count(c_cnt) as "Plants", count(d_cnt) as "Communities",
count(e_cnt) as "Extant", count(f_cnt) as "Historic/Extirpated", count(g_cnt) as "eAnimals", count(h_cnt) as "hAnimals",
count(i_cnt) as "ePlants", count(j_cnt) as "hPlants", count(k_cnt) as "eCommunities", count(l_cnt) as "hCommunities"
from total_list
group by quad_name
order by "allRecords" desc