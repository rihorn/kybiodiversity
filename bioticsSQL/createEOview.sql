/* the follow statement creates a view in the database */
/* assigning values to taxonomy types*/
CREATE OR REPLACE VIEW EO_QUADS_VW
AS
  SELECT
    CASE
      WHEN( egt.elcode_bcd LIKE 'N%' )
      THEN 'Plants'
      WHEN( egt.elcode_bcd LIKE 'P%' )
      THEN 'Plants'
      WHEN( egt.elcode_bcd LIKE 'C%' )
      THEN 'Community'
      ELSE 'Animals'
    END taxonomy,
    sa.attribute_value quad_name,
    RANK.basic_eo_rank_cd eoRank,
    RANK.basic_eo_rank_desc eoRankDesc,
    eo.precision_bcd PRECISION,
    eo_shape.shape shape
  FROM eo,
    eo_shape,
    d_basic_eo_rank RANK,
    shape,
    spatial_attribute sa,
    element_subnational est,
    element_national ent,
    element_global egt
  WHERE est.element_national_id = ent.element_national_id
  AND ent.element_global_id     = egt.ELEMENT_GLOBAL_ID
  AND sa.attribute_name         = 'Quadname'
  AND sa.feature_id             = shape.shape_id(+)
  AND shape.shape_id            = eo.shape_id
  AND eo.D_BASIC_EO_RANK_ID     = RANK.D_BASIC_EO_RANK_ID(+)
  AND eo.element_subnational_id = est.element_subnational_id
  AND eo.eo_id                  = eo_shape.eo_id
  AND eo.precision_bcd         IN ('S','M')
  AND eo.d_id_confirmed_id      = 2