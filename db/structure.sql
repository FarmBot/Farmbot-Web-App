SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: special_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.special_action AS ENUM (
    'dump_info',
    'emergency_lock',
    'emergency_unlock',
    'power_off',
    'read_status',
    'reboot',
    'sync',
    'take_photo'
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alerts (
    id bigint NOT NULL,
    problem_tag character varying NOT NULL,
    priority integer DEFAULT 100 NOT NULL,
    slug character varying NOT NULL,
    device_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: arg_names; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arg_names (
    id bigint NOT NULL,
    value character varying NOT NULL
);


--
-- Name: arg_names_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arg_names_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arg_names_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arg_names_id_seq OWNED BY public.arg_names.id;


--
-- Name: arg_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arg_sets (
    id bigint NOT NULL,
    fragment_id bigint NOT NULL,
    node_id bigint NOT NULL
);


--
-- Name: arg_sets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arg_sets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arg_sets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arg_sets_id_seq OWNED BY public.arg_sets.id;


--
-- Name: delayed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delayed_jobs (
    id integer NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    handler text NOT NULL,
    last_error text,
    run_at timestamp without time zone,
    locked_at timestamp without time zone,
    failed_at timestamp without time zone,
    locked_by character varying,
    queue character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: delayed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delayed_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delayed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delayed_jobs_id_seq OWNED BY public.delayed_jobs.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    name character varying DEFAULT 'FarmBot'::character varying,
    max_log_count integer DEFAULT 1000,
    max_images_count integer DEFAULT 100,
    timezone character varying(280),
    last_saw_api timestamp without time zone,
    last_saw_mq timestamp without time zone,
    fbos_version character varying(15),
    throttled_until timestamp without time zone,
    throttled_at timestamp without time zone,
    mounted_tool_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    serial_number character varying(32)
);


--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: diagnostic_dumps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnostic_dumps (
    id bigint NOT NULL,
    device_id bigint NOT NULL,
    ticket_identifier character varying NOT NULL,
    fbos_commit character varying NOT NULL,
    fbos_version character varying NOT NULL,
    firmware_commit character varying NOT NULL,
    firmware_state character varying NOT NULL,
    network_interface character varying NOT NULL,
    fbos_dmesg_dump text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sync_status character varying(12),
    wifi_level character varying(12),
    soc_temp character varying(12),
    firmware_hardware character varying(12),
    firmware_version character varying(12)
);


--
-- Name: diagnostic_dumps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.diagnostic_dumps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diagnostic_dumps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.diagnostic_dumps_id_seq OWNED BY public.diagnostic_dumps.id;


--
-- Name: edge_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edge_nodes (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sequence_id bigint NOT NULL,
    primary_node_id bigint NOT NULL,
    kind character varying(50),
    value character varying(300)
);


--
-- Name: edge_nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edge_nodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edge_nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edge_nodes_id_seq OWNED BY public.edge_nodes.id;


--
-- Name: farm_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farm_events (
    id integer NOT NULL,
    device_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    repeat integer,
    time_unit character varying,
    executable_type character varying(280),
    executable_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: farm_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farm_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farm_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farm_events_id_seq OWNED BY public.farm_events.id;


--
-- Name: farmware_envs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmware_envs (
    id bigint NOT NULL,
    device_id bigint,
    key character varying(100),
    value character varying(300),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: farmware_envs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmware_envs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmware_envs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmware_envs_id_seq OWNED BY public.farmware_envs.id;


--
-- Name: farmware_installations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmware_installations (
    id bigint NOT NULL,
    device_id bigint,
    url character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    package character varying(80),
    package_error character varying
);


--
-- Name: farmware_installations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmware_installations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmware_installations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmware_installations_id_seq OWNED BY public.farmware_installations.id;


--
-- Name: fbos_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fbos_configs (
    id bigint NOT NULL,
    device_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    auto_sync boolean DEFAULT true,
    beta_opt_in boolean DEFAULT false,
    disable_factory_reset boolean DEFAULT false,
    firmware_input_log boolean DEFAULT false,
    firmware_output_log boolean DEFAULT false,
    sequence_body_log boolean DEFAULT false,
    sequence_complete_log boolean DEFAULT false,
    sequence_init_log boolean DEFAULT false,
    network_not_found_timer integer,
    firmware_hardware character varying,
    api_migrated boolean DEFAULT true,
    os_auto_update boolean DEFAULT true,
    arduino_debug_messages boolean DEFAULT false,
    firmware_path character varying,
    firmware_debug_log boolean DEFAULT false,
    update_channel character varying(7) DEFAULT 'stable'::character varying
);


--
-- Name: fbos_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fbos_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fbos_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fbos_configs_id_seq OWNED BY public.fbos_configs.id;


--
-- Name: firmware_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firmware_configs (
    id bigint NOT NULL,
    device_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    encoder_enabled_x integer DEFAULT 0,
    encoder_enabled_y integer DEFAULT 0,
    encoder_enabled_z integer DEFAULT 0,
    encoder_invert_x integer DEFAULT 0,
    encoder_invert_y integer DEFAULT 0,
    encoder_invert_z integer DEFAULT 0,
    encoder_missed_steps_decay_x integer DEFAULT 5,
    encoder_missed_steps_decay_y integer DEFAULT 5,
    encoder_missed_steps_decay_z integer DEFAULT 5,
    encoder_missed_steps_max_x integer DEFAULT 5,
    encoder_missed_steps_max_y integer DEFAULT 5,
    encoder_missed_steps_max_z integer DEFAULT 5,
    encoder_scaling_x integer DEFAULT 5556,
    encoder_scaling_y integer DEFAULT 5556,
    encoder_scaling_z integer DEFAULT 5556,
    encoder_type_x integer DEFAULT 0,
    encoder_type_y integer DEFAULT 0,
    encoder_type_z integer DEFAULT 0,
    encoder_use_for_pos_x integer DEFAULT 0,
    encoder_use_for_pos_y integer DEFAULT 0,
    encoder_use_for_pos_z integer DEFAULT 0,
    movement_axis_nr_steps_x integer DEFAULT 0,
    movement_axis_nr_steps_y integer DEFAULT 0,
    movement_axis_nr_steps_z integer DEFAULT 0,
    movement_enable_endpoints_x integer DEFAULT 0,
    movement_enable_endpoints_y integer DEFAULT 0,
    movement_enable_endpoints_z integer DEFAULT 0,
    movement_home_at_boot_x integer DEFAULT 0,
    movement_home_at_boot_y integer DEFAULT 0,
    movement_home_at_boot_z integer DEFAULT 0,
    movement_home_spd_x integer DEFAULT 50,
    movement_home_spd_y integer DEFAULT 50,
    movement_home_spd_z integer DEFAULT 50,
    movement_home_up_x integer DEFAULT 0,
    movement_home_up_y integer DEFAULT 0,
    movement_home_up_z integer DEFAULT 1,
    movement_invert_endpoints_x integer DEFAULT 0,
    movement_invert_endpoints_y integer DEFAULT 0,
    movement_invert_endpoints_z integer DEFAULT 0,
    movement_invert_motor_x integer DEFAULT 0,
    movement_invert_motor_y integer DEFAULT 0,
    movement_invert_motor_z integer DEFAULT 0,
    movement_keep_active_x integer DEFAULT 1,
    movement_keep_active_y integer DEFAULT 1,
    movement_keep_active_z integer DEFAULT 1,
    movement_max_spd_x integer DEFAULT 400,
    movement_max_spd_y integer DEFAULT 400,
    movement_max_spd_z integer DEFAULT 400,
    movement_min_spd_x integer DEFAULT 50,
    movement_min_spd_y integer DEFAULT 50,
    movement_min_spd_z integer DEFAULT 50,
    movement_secondary_motor_invert_x integer DEFAULT 1,
    movement_secondary_motor_x integer DEFAULT 1,
    movement_step_per_mm_x double precision DEFAULT 5,
    movement_step_per_mm_y double precision DEFAULT 5,
    movement_step_per_mm_z double precision DEFAULT 25,
    movement_steps_acc_dec_x integer DEFAULT 300,
    movement_steps_acc_dec_y integer DEFAULT 300,
    movement_steps_acc_dec_z integer DEFAULT 300,
    movement_stop_at_home_x integer DEFAULT 0,
    movement_stop_at_home_y integer DEFAULT 0,
    movement_stop_at_home_z integer DEFAULT 0,
    movement_stop_at_max_x integer DEFAULT 0,
    movement_stop_at_max_y integer DEFAULT 0,
    movement_stop_at_max_z integer DEFAULT 0,
    movement_timeout_x integer DEFAULT 120,
    movement_timeout_y integer DEFAULT 120,
    movement_timeout_z integer DEFAULT 120,
    param_config_ok integer DEFAULT 0,
    param_e_stop_on_mov_err integer DEFAULT 0,
    param_mov_nr_retry integer DEFAULT 3,
    param_test integer DEFAULT 0,
    param_use_eeprom integer DEFAULT 1,
    param_version integer DEFAULT 1,
    pin_guard_1_active_state integer DEFAULT 1,
    pin_guard_1_pin_nr integer DEFAULT 0,
    pin_guard_1_time_out integer DEFAULT 60,
    pin_guard_2_active_state integer DEFAULT 1,
    pin_guard_2_pin_nr integer DEFAULT 0,
    pin_guard_2_time_out integer DEFAULT 60,
    pin_guard_3_active_state integer DEFAULT 1,
    pin_guard_3_pin_nr integer DEFAULT 0,
    pin_guard_3_time_out integer DEFAULT 60,
    pin_guard_4_active_state integer DEFAULT 1,
    pin_guard_4_pin_nr integer DEFAULT 0,
    pin_guard_4_time_out integer DEFAULT 60,
    pin_guard_5_active_state integer DEFAULT 1,
    pin_guard_5_pin_nr integer DEFAULT 0,
    pin_guard_5_time_out integer DEFAULT 60,
    api_migrated boolean DEFAULT true,
    movement_invert_2_endpoints_x integer DEFAULT 0,
    movement_invert_2_endpoints_y integer DEFAULT 0,
    movement_invert_2_endpoints_z integer DEFAULT 0,
    movement_microsteps_x integer DEFAULT 1,
    movement_microsteps_y integer DEFAULT 1,
    movement_microsteps_z integer DEFAULT 1
);


--
-- Name: firmware_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.firmware_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: firmware_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.firmware_configs_id_seq OWNED BY public.firmware_configs.id;


--
-- Name: fragments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fragments (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    device_id bigint,
    owner_type character varying NOT NULL,
    owner_id bigint NOT NULL
);


--
-- Name: fragments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fragments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fragments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fragments_id_seq OWNED BY public.fragments.id;


--
-- Name: global_bulletins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_bulletins (
    id bigint NOT NULL,
    href character varying,
    href_label character varying,
    slug character varying,
    title character varying,
    type character varying,
    content text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: global_bulletins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.global_bulletins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: global_bulletins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.global_bulletins_id_seq OWNED BY public.global_bulletins.id;


--
-- Name: global_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_configs (
    id bigint NOT NULL,
    key character varying,
    value text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: global_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.global_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: global_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.global_configs_id_seq OWNED BY public.global_configs.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.images (
    id integer NOT NULL,
    device_id integer,
    meta text,
    attachment_processed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    attachment_file_name character varying,
    attachment_content_type character varying,
    attachment_file_size integer,
    attachment_updated_at timestamp without time zone
);


--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.points (
    id integer NOT NULL,
    radius double precision DEFAULT 25.0 NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    z double precision DEFAULT 0.0 NOT NULL,
    device_id integer NOT NULL,
    meta public.hstore,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying DEFAULT 'untitled'::character varying NOT NULL,
    pointer_type character varying(280) NOT NULL,
    planted_at timestamp without time zone,
    openfarm_slug character varying(280) DEFAULT '50'::character varying NOT NULL,
    plant_stage character varying(10) DEFAULT 'planned'::character varying,
    tool_id integer,
    pullout_direction integer DEFAULT 0,
    migrated_at timestamp without time zone,
    discarded_at timestamp without time zone,
    gantry_mounted boolean DEFAULT false
);


--
-- Name: sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sequences (
    id integer NOT NULL,
    device_id integer,
    name character varying NOT NULL,
    color character varying,
    kind character varying(280) DEFAULT 'sequence'::character varying,
    updated_at timestamp without time zone,
    created_at timestamp without time zone,
    migrated_nodes boolean DEFAULT false
);


--
-- Name: in_use_points; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.in_use_points AS
 SELECT points.x,
    points.y,
    points.z,
    sequences.id AS sequence_id,
    edge_nodes.id AS edge_node_id,
    points.device_id,
    (edge_nodes.value)::integer AS point_id,
    points.pointer_type,
    points.name AS pointer_name,
    sequences.name AS sequence_name
   FROM ((public.edge_nodes
     JOIN public.sequences ON ((edge_nodes.sequence_id = sequences.id)))
     JOIN public.points ON (((edge_nodes.value)::integer = points.id)))
  WHERE ((edge_nodes.kind)::text = 'pointer_id'::text);


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id integer NOT NULL,
    name character varying(280),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    device_id integer
);


--
-- Name: in_use_tools; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.in_use_tools AS
 SELECT tools.id AS tool_id,
    tools.name AS tool_name,
    sequences.name AS sequence_name,
    sequences.id AS sequence_id,
    sequences.device_id
   FROM ((public.edge_nodes
     JOIN public.sequences ON ((edge_nodes.sequence_id = sequences.id)))
     JOIN public.tools ON (((edge_nodes.value)::integer = tools.id)))
  WHERE ((edge_nodes.kind)::text = 'tool_id'::text);


--
-- Name: kinds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kinds (
    id bigint NOT NULL,
    value character varying NOT NULL
);


--
-- Name: kinds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kinds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kinds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kinds_id_seq OWNED BY public.kinds.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    message text,
    meta text,
    channels character varying(280),
    device_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    type character varying(10) DEFAULT 'info'::character varying,
    major_version integer,
    minor_version integer,
    verbosity integer DEFAULT 1,
    x double precision,
    y double precision,
    z double precision,
    sent_at timestamp without time zone
);


--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nodes (
    id bigint NOT NULL,
    fragment_id bigint NOT NULL,
    kind_id bigint NOT NULL,
    body_id integer,
    next_id integer,
    parent_id integer
);


--
-- Name: nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nodes_id_seq OWNED BY public.nodes.id;


--
-- Name: peripherals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peripherals (
    id integer NOT NULL,
    device_id integer,
    pin integer,
    label character varying(280),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    mode integer DEFAULT 0
);


--
-- Name: peripherals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.peripherals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peripherals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.peripherals_id_seq OWNED BY public.peripherals.id;


--
-- Name: pin_bindings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pin_bindings (
    id bigint NOT NULL,
    device_id bigint,
    pin_num integer,
    sequence_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    special_action public.special_action
);


--
-- Name: pin_bindings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pin_bindings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pin_bindings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pin_bindings_id_seq OWNED BY public.pin_bindings.id;


--
-- Name: plant_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plant_templates (
    id bigint NOT NULL,
    saved_garden_id bigint NOT NULL,
    device_id bigint NOT NULL,
    radius double precision DEFAULT 25.0 NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    z double precision DEFAULT 0.0 NOT NULL,
    name character varying DEFAULT 'untitled'::character varying NOT NULL,
    openfarm_slug character varying(280) DEFAULT 'null'::character varying NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: plant_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plant_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plant_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plant_templates_id_seq OWNED BY public.plant_templates.id;


--
-- Name: points_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.points_id_seq OWNED BY public.points.id;


--
-- Name: primary_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primary_nodes (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sequence_id bigint NOT NULL,
    kind character varying(50),
    child_id bigint,
    parent_id bigint,
    parent_arg_name character varying(50),
    next_id bigint,
    body_id bigint,
    comment character varying(240)
);


--
-- Name: primary_nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.primary_nodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: primary_nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.primary_nodes_id_seq OWNED BY public.primary_nodes.id;


--
-- Name: primitive_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primitive_pairs (
    id bigint NOT NULL,
    fragment_id bigint NOT NULL,
    arg_name_id bigint NOT NULL,
    arg_set_id bigint NOT NULL,
    primitive_id bigint NOT NULL
);


--
-- Name: primitive_pairs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.primitive_pairs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: primitive_pairs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.primitive_pairs_id_seq OWNED BY public.primitive_pairs.id;


--
-- Name: primitives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primitives (
    id bigint NOT NULL,
    fragment_id bigint NOT NULL,
    value character varying NOT NULL
);


--
-- Name: primitives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.primitives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: primitives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.primitives_id_seq OWNED BY public.primitives.id;


--
-- Name: regimen_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regimen_items (
    id integer NOT NULL,
    time_offset bigint,
    regimen_id integer,
    sequence_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: regimen_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.regimen_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regimen_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.regimen_items_id_seq OWNED BY public.regimen_items.id;


--
-- Name: regimens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regimens (
    id integer NOT NULL,
    color character varying,
    name character varying(280),
    device_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: regimens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.regimens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regimens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.regimens_id_seq OWNED BY public.regimens.id;


--
-- Name: saved_gardens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_gardens (
    id bigint NOT NULL,
    name character varying NOT NULL,
    device_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: saved_gardens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_gardens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_gardens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_gardens_id_seq OWNED BY public.saved_gardens.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sensor_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sensor_readings (
    id bigint NOT NULL,
    device_id bigint,
    x double precision,
    y double precision,
    z double precision,
    value integer,
    pin integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    mode integer DEFAULT 0
);


--
-- Name: sensor_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sensor_readings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sensor_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sensor_readings_id_seq OWNED BY public.sensor_readings.id;


--
-- Name: sensors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sensors (
    id bigint NOT NULL,
    device_id bigint,
    pin integer,
    label character varying,
    mode integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: sensors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sensors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sensors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sensors_id_seq OWNED BY public.sensors.id;


--
-- Name: sequence_usage_reports; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sequence_usage_reports AS
 SELECT sequences.id AS sequence_id,
    ( SELECT count(*) AS count
           FROM public.edge_nodes
          WHERE (((edge_nodes.kind)::text = 'sequence_id'::text) AND ((edge_nodes.value)::integer = sequences.id))) AS edge_node_count,
    ( SELECT count(*) AS count
           FROM public.farm_events
          WHERE ((farm_events.executable_id = sequences.id) AND ((farm_events.executable_type)::text = 'Sequence'::text))) AS farm_event_count,
    ( SELECT count(*) AS count
           FROM public.regimen_items
          WHERE (regimen_items.sequence_id = sequences.id)) AS regimen_items_count
   FROM public.sequences;


--
-- Name: sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sequences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sequences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sequences_id_seq OWNED BY public.sequences.id;


--
-- Name: standard_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standard_pairs (
    id bigint NOT NULL,
    fragment_id bigint NOT NULL,
    arg_name_id bigint NOT NULL,
    arg_set_id bigint NOT NULL,
    node_id bigint NOT NULL
);


--
-- Name: standard_pairs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.standard_pairs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: standard_pairs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.standard_pairs_id_seq OWNED BY public.standard_pairs.id;


--
-- Name: token_issuances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_issuances (
    id bigint NOT NULL,
    device_id bigint NOT NULL,
    exp integer NOT NULL,
    jti character varying(45) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: token_issuances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_issuances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_issuances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_issuances_id_seq OWNED BY public.token_issuances.id;


--
-- Name: tools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tools_id_seq OWNED BY public.tools.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    device_id integer,
    name character varying,
    email character varying(280) DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip character varying,
    last_sign_in_ip character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    confirmed_at timestamp without time zone,
    confirmation_token character varying,
    agreed_to_terms_at timestamp without time zone,
    confirmation_sent_at timestamp without time zone,
    unconfirmed_email character varying
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: web_app_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_app_configs (
    id bigint NOT NULL,
    device_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    confirm_step_deletion boolean DEFAULT false,
    disable_animations boolean DEFAULT false,
    disable_i18n boolean DEFAULT false,
    display_trail boolean DEFAULT false,
    dynamic_map boolean DEFAULT false,
    encoder_figure boolean DEFAULT false,
    hide_webcam_widget boolean DEFAULT false,
    legend_menu_open boolean DEFAULT false,
    map_xl boolean DEFAULT false,
    raw_encoders boolean DEFAULT false,
    scaled_encoders boolean DEFAULT false,
    show_spread boolean DEFAULT true,
    show_farmbot boolean DEFAULT true,
    show_plants boolean DEFAULT true,
    show_points boolean DEFAULT true,
    x_axis_inverted boolean DEFAULT false,
    y_axis_inverted boolean DEFAULT false,
    z_axis_inverted boolean DEFAULT false,
    bot_origin_quadrant integer DEFAULT 2,
    zoom_level integer DEFAULT 1,
    success_log integer DEFAULT 1,
    busy_log integer DEFAULT 1,
    warn_log integer DEFAULT 1,
    error_log integer DEFAULT 1,
    info_log integer DEFAULT 1,
    fun_log integer DEFAULT 1,
    debug_log integer DEFAULT 1,
    stub_config boolean DEFAULT false,
    show_first_party_farmware boolean DEFAULT false,
    enable_browser_speak boolean DEFAULT false,
    show_images boolean DEFAULT false,
    photo_filter_begin character varying,
    photo_filter_end character varying,
    discard_unsaved boolean DEFAULT false,
    xy_swap boolean DEFAULT false,
    home_button_homing boolean DEFAULT true,
    show_motor_plot boolean DEFAULT false,
    show_historic_points boolean DEFAULT false,
    show_sensor_readings boolean DEFAULT false,
    show_dev_menu boolean DEFAULT false,
    internal_use text,
    time_format_24_hour boolean DEFAULT false,
    show_pins boolean DEFAULT false,
    disable_emergency_unlock_confirmation boolean DEFAULT false,
    map_size_x integer DEFAULT 2900,
    map_size_y integer DEFAULT 1400
);


--
-- Name: web_app_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.web_app_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_app_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.web_app_configs_id_seq OWNED BY public.web_app_configs.id;


--
-- Name: webcam_feeds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webcam_feeds (
    id bigint NOT NULL,
    device_id bigint,
    url character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying(80) DEFAULT 'Webcam Feed'::character varying
);


--
-- Name: webcam_feeds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webcam_feeds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webcam_feeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webcam_feeds_id_seq OWNED BY public.webcam_feeds.id;


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: arg_names id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arg_names ALTER COLUMN id SET DEFAULT nextval('public.arg_names_id_seq'::regclass);


--
-- Name: arg_sets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arg_sets ALTER COLUMN id SET DEFAULT nextval('public.arg_sets_id_seq'::regclass);


--
-- Name: delayed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delayed_jobs ALTER COLUMN id SET DEFAULT nextval('public.delayed_jobs_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: diagnostic_dumps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_dumps ALTER COLUMN id SET DEFAULT nextval('public.diagnostic_dumps_id_seq'::regclass);


--
-- Name: edge_nodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edge_nodes ALTER COLUMN id SET DEFAULT nextval('public.edge_nodes_id_seq'::regclass);


--
-- Name: farm_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farm_events ALTER COLUMN id SET DEFAULT nextval('public.farm_events_id_seq'::regclass);


--
-- Name: farmware_envs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_envs ALTER COLUMN id SET DEFAULT nextval('public.farmware_envs_id_seq'::regclass);


--
-- Name: farmware_installations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_installations ALTER COLUMN id SET DEFAULT nextval('public.farmware_installations_id_seq'::regclass);


--
-- Name: fbos_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fbos_configs ALTER COLUMN id SET DEFAULT nextval('public.fbos_configs_id_seq'::regclass);


--
-- Name: firmware_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firmware_configs ALTER COLUMN id SET DEFAULT nextval('public.firmware_configs_id_seq'::regclass);


--
-- Name: fragments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fragments ALTER COLUMN id SET DEFAULT nextval('public.fragments_id_seq'::regclass);


--
-- Name: global_bulletins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_bulletins ALTER COLUMN id SET DEFAULT nextval('public.global_bulletins_id_seq'::regclass);


--
-- Name: global_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_configs ALTER COLUMN id SET DEFAULT nextval('public.global_configs_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: kinds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kinds ALTER COLUMN id SET DEFAULT nextval('public.kinds_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: nodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nodes ALTER COLUMN id SET DEFAULT nextval('public.nodes_id_seq'::regclass);


--
-- Name: peripherals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peripherals ALTER COLUMN id SET DEFAULT nextval('public.peripherals_id_seq'::regclass);


--
-- Name: pin_bindings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_bindings ALTER COLUMN id SET DEFAULT nextval('public.pin_bindings_id_seq'::regclass);


--
-- Name: plant_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_templates ALTER COLUMN id SET DEFAULT nextval('public.plant_templates_id_seq'::regclass);


--
-- Name: points id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points ALTER COLUMN id SET DEFAULT nextval('public.points_id_seq'::regclass);


--
-- Name: primary_nodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_nodes ALTER COLUMN id SET DEFAULT nextval('public.primary_nodes_id_seq'::regclass);


--
-- Name: primitive_pairs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primitive_pairs ALTER COLUMN id SET DEFAULT nextval('public.primitive_pairs_id_seq'::regclass);


--
-- Name: primitives id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primitives ALTER COLUMN id SET DEFAULT nextval('public.primitives_id_seq'::regclass);


--
-- Name: regimen_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regimen_items ALTER COLUMN id SET DEFAULT nextval('public.regimen_items_id_seq'::regclass);


--
-- Name: regimens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regimens ALTER COLUMN id SET DEFAULT nextval('public.regimens_id_seq'::regclass);


--
-- Name: saved_gardens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_gardens ALTER COLUMN id SET DEFAULT nextval('public.saved_gardens_id_seq'::regclass);


--
-- Name: sensor_readings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensor_readings ALTER COLUMN id SET DEFAULT nextval('public.sensor_readings_id_seq'::regclass);


--
-- Name: sensors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensors ALTER COLUMN id SET DEFAULT nextval('public.sensors_id_seq'::regclass);


--
-- Name: sequences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sequences ALTER COLUMN id SET DEFAULT nextval('public.sequences_id_seq'::regclass);


--
-- Name: standard_pairs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_pairs ALTER COLUMN id SET DEFAULT nextval('public.standard_pairs_id_seq'::regclass);


--
-- Name: token_issuances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_issuances ALTER COLUMN id SET DEFAULT nextval('public.token_issuances_id_seq'::regclass);


--
-- Name: tools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools ALTER COLUMN id SET DEFAULT nextval('public.tools_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: web_app_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_app_configs ALTER COLUMN id SET DEFAULT nextval('public.web_app_configs_id_seq'::regclass);


--
-- Name: webcam_feeds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webcam_feeds ALTER COLUMN id SET DEFAULT nextval('public.webcam_feeds_id_seq'::regclass);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: arg_names arg_names_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arg_names
    ADD CONSTRAINT arg_names_pkey PRIMARY KEY (id);


--
-- Name: arg_sets arg_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arg_sets
    ADD CONSTRAINT arg_sets_pkey PRIMARY KEY (id);


--
-- Name: delayed_jobs delayed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delayed_jobs
    ADD CONSTRAINT delayed_jobs_pkey PRIMARY KEY (id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: diagnostic_dumps diagnostic_dumps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_dumps
    ADD CONSTRAINT diagnostic_dumps_pkey PRIMARY KEY (id);


--
-- Name: edge_nodes edge_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edge_nodes
    ADD CONSTRAINT edge_nodes_pkey PRIMARY KEY (id);


--
-- Name: farm_events farm_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farm_events
    ADD CONSTRAINT farm_events_pkey PRIMARY KEY (id);


--
-- Name: farmware_envs farmware_envs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_envs
    ADD CONSTRAINT farmware_envs_pkey PRIMARY KEY (id);


--
-- Name: farmware_installations farmware_installations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_installations
    ADD CONSTRAINT farmware_installations_pkey PRIMARY KEY (id);


--
-- Name: fbos_configs fbos_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fbos_configs
    ADD CONSTRAINT fbos_configs_pkey PRIMARY KEY (id);


--
-- Name: firmware_configs firmware_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firmware_configs
    ADD CONSTRAINT firmware_configs_pkey PRIMARY KEY (id);


--
-- Name: fragments fragments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fragments
    ADD CONSTRAINT fragments_pkey PRIMARY KEY (id);


--
-- Name: global_bulletins global_bulletins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_bulletins
    ADD CONSTRAINT global_bulletins_pkey PRIMARY KEY (id);


--
-- Name: global_configs global_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_configs
    ADD CONSTRAINT global_configs_pkey PRIMARY KEY (id);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: kinds kinds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kinds
    ADD CONSTRAINT kinds_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: nodes nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (id);


--
-- Name: peripherals peripherals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peripherals
    ADD CONSTRAINT peripherals_pkey PRIMARY KEY (id);


--
-- Name: pin_bindings pin_bindings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_bindings
    ADD CONSTRAINT pin_bindings_pkey PRIMARY KEY (id);


--
-- Name: plant_templates plant_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_templates
    ADD CONSTRAINT plant_templates_pkey PRIMARY KEY (id);


--
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: primary_nodes primary_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_nodes
    ADD CONSTRAINT primary_nodes_pkey PRIMARY KEY (id);


--
-- Name: primitive_pairs primitive_pairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primitive_pairs
    ADD CONSTRAINT primitive_pairs_pkey PRIMARY KEY (id);


--
-- Name: primitives primitives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primitives
    ADD CONSTRAINT primitives_pkey PRIMARY KEY (id);


--
-- Name: regimen_items regimen_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regimen_items
    ADD CONSTRAINT regimen_items_pkey PRIMARY KEY (id);


--
-- Name: regimens regimens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regimens
    ADD CONSTRAINT regimens_pkey PRIMARY KEY (id);


--
-- Name: saved_gardens saved_gardens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_gardens
    ADD CONSTRAINT saved_gardens_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sensor_readings sensor_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (id);


--
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id);


--
-- Name: sequences sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sequences
    ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);


--
-- Name: standard_pairs standard_pairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_pairs
    ADD CONSTRAINT standard_pairs_pkey PRIMARY KEY (id);


--
-- Name: token_issuances token_issuances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_issuances
    ADD CONSTRAINT token_issuances_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: web_app_configs web_app_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_app_configs
    ADD CONSTRAINT web_app_configs_pkey PRIMARY KEY (id);


--
-- Name: webcam_feeds webcam_feeds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webcam_feeds
    ADD CONSTRAINT webcam_feeds_pkey PRIMARY KEY (id);


--
-- Name: delayed_jobs_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delayed_jobs_priority ON public.delayed_jobs USING btree (priority, run_at);


--
-- Name: index_alerts_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_alerts_on_device_id ON public.alerts USING btree (device_id);


--
-- Name: index_arg_sets_on_fragment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_arg_sets_on_fragment_id ON public.arg_sets USING btree (fragment_id);


--
-- Name: index_arg_sets_on_node_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_arg_sets_on_node_id ON public.arg_sets USING btree (node_id);


--
-- Name: index_devices_on_mounted_tool_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_devices_on_mounted_tool_id ON public.devices USING btree (mounted_tool_id);


--
-- Name: index_devices_on_timezone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_devices_on_timezone ON public.devices USING btree (timezone);


--
-- Name: index_diagnostic_dumps_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_diagnostic_dumps_on_device_id ON public.diagnostic_dumps USING btree (device_id);


--
-- Name: index_edge_nodes_on_kind_and_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edge_nodes_on_kind_and_value ON public.edge_nodes USING btree (kind, value);


--
-- Name: index_edge_nodes_on_primary_node_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edge_nodes_on_primary_node_id ON public.edge_nodes USING btree (primary_node_id);


--
-- Name: index_edge_nodes_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edge_nodes_on_sequence_id ON public.edge_nodes USING btree (sequence_id);


--
-- Name: index_farm_events_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farm_events_on_device_id ON public.farm_events USING btree (device_id);


--
-- Name: index_farm_events_on_end_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farm_events_on_end_time ON public.farm_events USING btree (end_time);


--
-- Name: index_farm_events_on_executable_type_and_executable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farm_events_on_executable_type_and_executable_id ON public.farm_events USING btree (executable_type, executable_id);


--
-- Name: index_farmware_envs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farmware_envs_on_device_id ON public.farmware_envs USING btree (device_id);


--
-- Name: index_farmware_installations_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farmware_installations_on_device_id ON public.farmware_installations USING btree (device_id);


--
-- Name: index_fbos_configs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_fbos_configs_on_device_id ON public.fbos_configs USING btree (device_id);


--
-- Name: index_firmware_configs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_firmware_configs_on_device_id ON public.firmware_configs USING btree (device_id);


--
-- Name: index_fragments_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_fragments_on_device_id ON public.fragments USING btree (device_id);


--
-- Name: index_fragments_on_owner_type_and_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_fragments_on_owner_type_and_owner_id ON public.fragments USING btree (owner_type, owner_id);


--
-- Name: index_global_configs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_global_configs_on_key ON public.global_configs USING btree (key);


--
-- Name: index_images_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_images_on_device_id ON public.images USING btree (device_id);


--
-- Name: index_logs_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_created_at ON public.logs USING btree (created_at);


--
-- Name: index_logs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_device_id ON public.logs USING btree (device_id);


--
-- Name: index_logs_on_device_id_and_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_device_id_and_created_at ON public.logs USING btree (device_id, created_at);


--
-- Name: index_logs_on_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_sent_at ON public.logs USING btree (sent_at);


--
-- Name: index_logs_on_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_type ON public.logs USING btree (type);


--
-- Name: index_logs_on_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_updated_at ON public.logs USING btree (updated_at);


--
-- Name: index_logs_on_verbosity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_verbosity ON public.logs USING btree (verbosity);


--
-- Name: index_logs_on_verbosity_and_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_verbosity_and_type ON public.logs USING btree (verbosity, type);


--
-- Name: index_nodes_on_fragment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nodes_on_fragment_id ON public.nodes USING btree (fragment_id);


--
-- Name: index_nodes_on_kind_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nodes_on_kind_id ON public.nodes USING btree (kind_id);


--
-- Name: index_peripherals_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_peripherals_on_device_id ON public.peripherals USING btree (device_id);


--
-- Name: index_peripherals_on_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_peripherals_on_mode ON public.peripherals USING btree (mode);


--
-- Name: index_pin_bindings_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pin_bindings_on_device_id ON public.pin_bindings USING btree (device_id);


--
-- Name: index_pin_bindings_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pin_bindings_on_sequence_id ON public.pin_bindings USING btree (sequence_id);


--
-- Name: index_plant_templates_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_plant_templates_on_device_id ON public.plant_templates USING btree (device_id);


--
-- Name: index_plant_templates_on_saved_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_plant_templates_on_saved_garden_id ON public.plant_templates USING btree (saved_garden_id);


--
-- Name: index_points_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_device_id ON public.points USING btree (device_id);


--
-- Name: index_points_on_device_id_and_tool_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_points_on_device_id_and_tool_id ON public.points USING btree (device_id, tool_id);


--
-- Name: index_points_on_discarded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_discarded_at ON public.points USING btree (discarded_at);


--
-- Name: index_points_on_id_and_pointer_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_id_and_pointer_type ON public.points USING btree (id, pointer_type);


--
-- Name: index_points_on_meta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_meta ON public.points USING gin (meta);


--
-- Name: index_points_on_tool_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_tool_id ON public.points USING btree (tool_id);


--
-- Name: index_primary_nodes_on_body_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primary_nodes_on_body_id ON public.primary_nodes USING btree (body_id);


--
-- Name: index_primary_nodes_on_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primary_nodes_on_child_id ON public.primary_nodes USING btree (child_id);


--
-- Name: index_primary_nodes_on_next_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primary_nodes_on_next_id ON public.primary_nodes USING btree (next_id);


--
-- Name: index_primary_nodes_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primary_nodes_on_parent_id ON public.primary_nodes USING btree (parent_id);


--
-- Name: index_primary_nodes_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primary_nodes_on_sequence_id ON public.primary_nodes USING btree (sequence_id);


--
-- Name: index_primitive_pairs_on_arg_name_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primitive_pairs_on_arg_name_id ON public.primitive_pairs USING btree (arg_name_id);


--
-- Name: index_primitive_pairs_on_arg_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primitive_pairs_on_arg_set_id ON public.primitive_pairs USING btree (arg_set_id);


--
-- Name: index_primitive_pairs_on_fragment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primitive_pairs_on_fragment_id ON public.primitive_pairs USING btree (fragment_id);


--
-- Name: index_primitive_pairs_on_primitive_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primitive_pairs_on_primitive_id ON public.primitive_pairs USING btree (primitive_id);


--
-- Name: index_primitives_on_fragment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_primitives_on_fragment_id ON public.primitives USING btree (fragment_id);


--
-- Name: index_regimen_items_on_regimen_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimen_items_on_regimen_id ON public.regimen_items USING btree (regimen_id);


--
-- Name: index_regimen_items_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimen_items_on_sequence_id ON public.regimen_items USING btree (sequence_id);


--
-- Name: index_regimens_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimens_on_device_id ON public.regimens USING btree (device_id);


--
-- Name: index_saved_gardens_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saved_gardens_on_device_id ON public.saved_gardens USING btree (device_id);


--
-- Name: index_sensor_readings_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sensor_readings_on_device_id ON public.sensor_readings USING btree (device_id);


--
-- Name: index_sensors_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sensors_on_device_id ON public.sensors USING btree (device_id);


--
-- Name: index_sequences_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequences_on_created_at ON public.sequences USING btree (created_at);


--
-- Name: index_sequences_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequences_on_device_id ON public.sequences USING btree (device_id);


--
-- Name: index_standard_pairs_on_arg_name_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_standard_pairs_on_arg_name_id ON public.standard_pairs USING btree (arg_name_id);


--
-- Name: index_standard_pairs_on_arg_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_standard_pairs_on_arg_set_id ON public.standard_pairs USING btree (arg_set_id);


--
-- Name: index_standard_pairs_on_fragment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_standard_pairs_on_fragment_id ON public.standard_pairs USING btree (fragment_id);


--
-- Name: index_standard_pairs_on_node_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_standard_pairs_on_node_id ON public.standard_pairs USING btree (node_id);


--
-- Name: index_token_issuances_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_token_issuances_on_device_id ON public.token_issuances USING btree (device_id);


--
-- Name: index_token_issuances_on_exp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_token_issuances_on_exp ON public.token_issuances USING btree (exp);


--
-- Name: index_token_issuances_on_jti_and_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_token_issuances_on_jti_and_device_id ON public.token_issuances USING btree (jti, device_id);


--
-- Name: index_tools_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tools_on_device_id ON public.tools USING btree (device_id);


--
-- Name: index_users_on_agreed_to_terms_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_agreed_to_terms_at ON public.users USING btree (agreed_to_terms_at);


--
-- Name: index_users_on_confirmation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_confirmation_token ON public.users USING btree (confirmation_token);


--
-- Name: index_users_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_device_id ON public.users USING btree (device_id);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_web_app_configs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_web_app_configs_on_device_id ON public.web_app_configs USING btree (device_id);


--
-- Name: index_webcam_feeds_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webcam_feeds_on_device_id ON public.webcam_feeds USING btree (device_id);


--
-- Name: sensor_readings fk_rails_04297fb1ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT fk_rails_04297fb1ff FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: pin_bindings fk_rails_1f1c3b6979; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_bindings
    ADD CONSTRAINT fk_rails_1f1c3b6979 FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: sensors fk_rails_92e56bf2fb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT fk_rails_92e56bf2fb FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: points fk_rails_a62cbb8aca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT fk_rails_a62cbb8aca FOREIGN KEY (tool_id) REFERENCES public.tools(id);


--
-- Name: primary_nodes fk_rails_bca7fee3b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_nodes
    ADD CONSTRAINT fk_rails_bca7fee3b9 FOREIGN KEY (sequence_id) REFERENCES public.sequences(id);


--
-- Name: farmware_envs fk_rails_bdadc396eb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_envs
    ADD CONSTRAINT fk_rails_bdadc396eb FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: alerts fk_rails_c0132c78be; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_rails_c0132c78be FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: diagnostic_dumps fk_rails_c5df7fdc83; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_dumps
    ADD CONSTRAINT fk_rails_c5df7fdc83 FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: farmware_installations fk_rails_c72f38683f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmware_installations
    ADD CONSTRAINT fk_rails_c72f38683f FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: edge_nodes fk_rails_c86213fd78; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edge_nodes
    ADD CONSTRAINT fk_rails_c86213fd78 FOREIGN KEY (sequence_id) REFERENCES public.sequences(id);


--
-- Name: points fk_rails_d6f3cdbe9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT fk_rails_d6f3cdbe9a FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: token_issuances fk_rails_e202a61188; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_issuances
    ADD CONSTRAINT fk_rails_e202a61188 FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: devices fk_rails_eef5afaff7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_rails_eef5afaff7 FOREIGN KEY (mounted_tool_id) REFERENCES public.tools(id);


--
-- Name: pin_bindings fk_rails_f72ee24d98; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_bindings
    ADD CONSTRAINT fk_rails_f72ee24d98 FOREIGN KEY (sequence_id) REFERENCES public.sequences(id);


--
-- Name: peripherals fk_rails_fdaad0007f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peripherals
    ADD CONSTRAINT fk_rails_fdaad0007f FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20170629160248'),
('20170703010946'),
('20170807143633'),
('20170814084814'),
('20170818163411'),
('20170918173928'),
('20171003143906'),
('20171003144428'),
('20171017200333'),
('20171031184914'),
('20180104215253'),
('20180105175215'),
('20180109070610'),
('20180109165402'),
('20180121191538'),
('20180122203010'),
('20180124194814'),
('20180126141955'),
('20180201031848'),
('20180201153221'),
('20180202165503'),
('20180205173255'),
('20180209134752'),
('20180211161515'),
('20180213175531'),
('20180215064728'),
('20180215171709'),
('20180215205625'),
('20180215224528'),
('20180216205047'),
('20180217173606'),
('20180226164100'),
('20180227172811'),
('20180228144634'),
('20180301222052'),
('20180305170608'),
('20180306195021'),
('20180310220435'),
('20180315205136'),
('20180323190601'),
('20180325220047'),
('20180325222824'),
('20180326160853'),
('20180328200512'),
('20180328212540'),
('20180330130914'),
('20180330143232'),
('20180401141611'),
('20180403211523'),
('20180404165355'),
('20180407131311'),
('20180409150813'),
('20180410160336'),
('20180410180929'),
('20180410192539'),
('20180411122627'),
('20180411175813'),
('20180412144034'),
('20180412191221'),
('20180412224141'),
('20180413125139'),
('20180413145332'),
('20180417123713'),
('20180418205557'),
('20180419164627'),
('20180423171551'),
('20180423202520'),
('20180430161447'),
('20180501121046'),
('20180502050250'),
('20180508141310'),
('20180518131709'),
('20180520201349'),
('20180521140428'),
('20180521195953'),
('20180524161501'),
('20180606131907'),
('20180609144559'),
('20180615153318'),
('20180713182937'),
('20180716163108'),
('20180719143412'),
('20180720021451'),
('20180726145505'),
('20180726165546'),
('20180727152741'),
('20180813185430'),
('20180815143819'),
('20180829211322'),
('20180910143055'),
('20180920194120'),
('20180925203846'),
('20180926161918'),
('20181014221342'),
('20181019023351'),
('20181025182807'),
('20181112010427'),
('20181126175951'),
('20181204005038'),
('20181208035706'),
('20190103211708'),
('20190103213956'),
('20190108211419'),
('20190209133811'),
('20190212215842'),
('20190307205648'),
('20190401212119'),
('20190411152319'),
('20190411171401'),
('20190411222900'),
('20190416035406'),
('20190417165636'),
('20190419001321'),
('20190419052844'),
('20190419174728'),
('20190419174811'),
('20190501143201'),
('20190502163453'),
('20190504170018'),
('20190512015442'),
('20190513221836'),
('20190515185612'),
('20190515205442');


