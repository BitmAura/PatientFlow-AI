-- Staff Performance Audit (2024-04-04) - FINAL CONSOLIDATED VERSION
-- Purpose: Track revenue conversion by doctor/staff member for AI-generated leads.
-- Status: Verified Working (Fixed name parity errors)

DROP VIEW IF EXISTS v_staff_performance;

CREATE OR REPLACE VIEW v_staff_performance AS
SELECT 
    s.id AS staff_id,
    COALESCE(d.name, s.user_id::text) AS staff_name, -- Dynamic fallback to prevent SQL errors
    s.clinic_id,
    COUNT(l.id) AS total_leads_assigned,
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END) AS converted_leads,
    SUM(COALESCE(l.actual_revenue, 0)) AS total_revenue_confirmed,
    SUM(COALESCE(l.estimated_value, 0)) AS total_pipeline_value,
    CASE 
        WHEN COUNT(l.id) > 0 THEN (COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::NUMERIC / COUNT(l.id)::NUMERIC) * 100 
        ELSE 0 
    END AS conversion_rate,
    COUNT(CASE WHEN l.treatment_tier = 'tier_1' AND l.status = 'converted' THEN 1 END) AS high_ticket_closes
FROM 
    staff s
LEFT JOIN 
    doctors d ON s.user_id::uuid = d.id::uuid OR s.id = d.id
LEFT JOIN 
    leads l ON s.id = l.assigned_to
GROUP BY 
    s.id, d.name, s.user_id, s.clinic_id;

COMMENT ON VIEW v_staff_performance IS 'Aggregated performance metrics for clinic staff, consolidated from fix v2.';
