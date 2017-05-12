--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.5
-- Dumped by pg_dump version 9.5.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: delayed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE delayed_jobs (
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

CREATE SEQUENCE delayed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delayed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE delayed_jobs_id_seq OWNED BY delayed_jobs.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE devices (
    id integer NOT NULL,
    name character varying,
    webcam_url character varying,
    max_log_count integer DEFAULT 100,
    max_images_count integer DEFAULT 100
);


--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE devices_id_seq OWNED BY devices.id;


--
-- Name: farm_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE farm_events (
    id integer NOT NULL,
    device_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    repeat integer,
    time_unit character varying,
    executable_type character varying,
    executable_id integer
);


--
-- Name: farm_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE farm_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farm_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE farm_events_id_seq OWNED BY farm_events.id;


--
-- Name: generic_pointers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE generic_pointers (
    id integer NOT NULL
);


--
-- Name: generic_pointers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE generic_pointers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generic_pointers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE generic_pointers_id_seq OWNED BY generic_pointers.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE images (
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

CREATE SEQUENCE images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE images_id_seq OWNED BY images.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE logs (
    id integer NOT NULL,
    message text,
    meta text,
    channels text,
    device_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE logs_id_seq OWNED BY logs.id;


--
-- Name: peripherals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE peripherals (
    id integer NOT NULL,
    device_id integer,
    pin integer,
    mode integer,
    label character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: peripherals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE peripherals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peripherals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE peripherals_id_seq OWNED BY peripherals.id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE plants (
    id integer NOT NULL,
    openfarm_slug character varying DEFAULT '50'::character varying NOT NULL,
    created_at timestamp without time zone
);


--
-- Name: plants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE plants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE plants_id_seq OWNED BY plants.id;


--
-- Name: points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE points (
    id integer NOT NULL,
    radius double precision DEFAULT 50.0 NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    z double precision DEFAULT 0.0 NOT NULL,
    device_id integer NOT NULL,
    meta hstore,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying DEFAULT 'untitled'::character varying NOT NULL,
    pointer_type character varying,
    pointer_id integer
);


--
-- Name: points_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE points_id_seq OWNED BY points.id;


--
-- Name: regimen_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE regimen_items (
    id integer NOT NULL,
    time_offset bigint,
    regimen_id integer,
    sequence_id integer
);


--
-- Name: regimen_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE regimen_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regimen_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE regimen_items_id_seq OWNED BY regimen_items.id;


--
-- Name: regimens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE regimens (
    id integer NOT NULL,
    color character varying,
    name character varying,
    device_id integer
);


--
-- Name: regimens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE regimens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regimens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE regimens_id_seq OWNED BY regimens.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sequence_dependencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sequence_dependencies (
    id integer NOT NULL,
    dependency_type character varying,
    dependency_id integer,
    sequence_id integer NOT NULL
);


--
-- Name: sequence_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sequence_dependencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sequence_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE sequence_dependencies_id_seq OWNED BY sequence_dependencies.id;


--
-- Name: sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sequences (
    id integer NOT NULL,
    device_id integer,
    name character varying NOT NULL,
    color character varying,
    kind character varying DEFAULT 'sequence'::character varying,
    args text,
    body text,
    updated_at timestamp without time zone,
    created_at timestamp without time zone
);


--
-- Name: sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sequences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sequences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE sequences_id_seq OWNED BY sequences.id;


--
-- Name: token_expirations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE token_expirations (
    id integer NOT NULL,
    sub character varying,
    exp integer,
    jti character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: token_expirations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE token_expirations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_expirations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE token_expirations_id_seq OWNED BY token_expirations.id;


--
-- Name: tool_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tool_slots (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tool_id integer
);


--
-- Name: tool_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tool_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tool_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tool_slots_id_seq OWNED BY tool_slots.id;


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tools (
    id integer NOT NULL,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    device_id integer
);


--
-- Name: tools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tools_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tools_id_seq OWNED BY tools.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    device_id integer,
    name character varying,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip character varying,
    last_sign_in_ip character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    verified_at timestamp without time zone,
    verification_token character varying,
    agreed_to_terms_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY delayed_jobs ALTER COLUMN id SET DEFAULT nextval('delayed_jobs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY devices ALTER COLUMN id SET DEFAULT nextval('devices_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY farm_events ALTER COLUMN id SET DEFAULT nextval('farm_events_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY generic_pointers ALTER COLUMN id SET DEFAULT nextval('generic_pointers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY images ALTER COLUMN id SET DEFAULT nextval('images_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY logs ALTER COLUMN id SET DEFAULT nextval('logs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY peripherals ALTER COLUMN id SET DEFAULT nextval('peripherals_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY plants ALTER COLUMN id SET DEFAULT nextval('plants_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY points ALTER COLUMN id SET DEFAULT nextval('points_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY regimen_items ALTER COLUMN id SET DEFAULT nextval('regimen_items_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY regimens ALTER COLUMN id SET DEFAULT nextval('regimens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY sequence_dependencies ALTER COLUMN id SET DEFAULT nextval('sequence_dependencies_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY sequences ALTER COLUMN id SET DEFAULT nextval('sequences_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY token_expirations ALTER COLUMN id SET DEFAULT nextval('token_expirations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tool_slots ALTER COLUMN id SET DEFAULT nextval('tool_slots_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tools ALTER COLUMN id SET DEFAULT nextval('tools_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: delayed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY delayed_jobs
    ADD CONSTRAINT delayed_jobs_pkey PRIMARY KEY (id);


--
-- Name: devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: farm_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY farm_events
    ADD CONSTRAINT farm_events_pkey PRIMARY KEY (id);


--
-- Name: generic_pointers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY generic_pointers
    ADD CONSTRAINT generic_pointers_pkey PRIMARY KEY (id);


--
-- Name: images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: peripherals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY peripherals
    ADD CONSTRAINT peripherals_pkey PRIMARY KEY (id);


--
-- Name: plants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- Name: points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: regimen_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY regimen_items
    ADD CONSTRAINT regimen_items_pkey PRIMARY KEY (id);


--
-- Name: regimens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY regimens
    ADD CONSTRAINT regimens_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sequence_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sequence_dependencies
    ADD CONSTRAINT sequence_dependencies_pkey PRIMARY KEY (id);


--
-- Name: sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sequences
    ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);


--
-- Name: token_expirations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY token_expirations
    ADD CONSTRAINT token_expirations_pkey PRIMARY KEY (id);


--
-- Name: tool_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tool_slots
    ADD CONSTRAINT tool_slots_pkey PRIMARY KEY (id);


--
-- Name: tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: delayed_jobs_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delayed_jobs_priority ON delayed_jobs USING btree (priority, run_at);


--
-- Name: index_farm_events_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farm_events_on_device_id ON farm_events USING btree (device_id);


--
-- Name: index_farm_events_on_executable_type_and_executable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_farm_events_on_executable_type_and_executable_id ON farm_events USING btree (executable_type, executable_id);


--
-- Name: index_images_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_images_on_device_id ON images USING btree (device_id);


--
-- Name: index_logs_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_logs_on_device_id ON logs USING btree (device_id);


--
-- Name: index_peripherals_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_peripherals_on_device_id ON peripherals USING btree (device_id);


--
-- Name: index_plants_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_plants_on_created_at ON plants USING btree (created_at);


--
-- Name: index_points_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_device_id ON points USING btree (device_id);


--
-- Name: index_points_on_meta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_meta ON points USING gin (meta);


--
-- Name: index_points_on_pointer_type_and_pointer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_points_on_pointer_type_and_pointer_id ON points USING btree (pointer_type, pointer_id);


--
-- Name: index_regimen_items_on_regimen_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimen_items_on_regimen_id ON regimen_items USING btree (regimen_id);


--
-- Name: index_regimen_items_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimen_items_on_sequence_id ON regimen_items USING btree (sequence_id);


--
-- Name: index_regimens_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_regimens_on_device_id ON regimens USING btree (device_id);


--
-- Name: index_sequence_dependencies_on_dependency_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequence_dependencies_on_dependency_id ON sequence_dependencies USING btree (dependency_id);


--
-- Name: index_sequence_dependencies_on_dependency_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequence_dependencies_on_dependency_type ON sequence_dependencies USING btree (dependency_type);


--
-- Name: index_sequence_dependencies_on_sequence_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequence_dependencies_on_sequence_id ON sequence_dependencies USING btree (sequence_id);


--
-- Name: index_sequences_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequences_on_created_at ON sequences USING btree (created_at);


--
-- Name: index_sequences_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sequences_on_device_id ON sequences USING btree (device_id);


--
-- Name: index_tool_slots_on_tool_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tool_slots_on_tool_id ON tool_slots USING btree (tool_id);


--
-- Name: index_tools_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tools_on_device_id ON tools USING btree (device_id);


--
-- Name: index_users_on_agreed_to_terms_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_agreed_to_terms_at ON users USING btree (agreed_to_terms_at);


--
-- Name: index_users_on_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_device_id ON users USING btree (device_id);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON users USING btree (email);


--
-- Name: fk_rails_530382799e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tool_slots
    ADD CONSTRAINT fk_rails_530382799e FOREIGN KEY (tool_id) REFERENCES tools(id);


--
-- Name: fk_rails_6683768045; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sequence_dependencies
    ADD CONSTRAINT fk_rails_6683768045 FOREIGN KEY (sequence_id) REFERENCES sequences(id);


--
-- Name: fk_rails_d6f3cdbe9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY points
    ADD CONSTRAINT fk_rails_d6f3cdbe9a FOREIGN KEY (device_id) REFERENCES devices(id);


--
-- Name: fk_rails_fdaad0007f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY peripherals
    ADD CONSTRAINT fk_rails_fdaad0007f FOREIGN KEY (device_id) REFERENCES devices(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO schema_migrations (version) VALUES ('20160820050202'), ('20160905151345'), ('20160905172003'), ('20160914201415'), ('20160916132424'), ('20160919153025'), ('20161006154039'), ('20161006182657'), ('20161006190538'), ('20161010145613'), ('20161011185734'), ('20161011221406'), ('20161028175744'), ('20161128192105'), ('20161129155523'), ('20161201195329'), ('20161205222137'), ('20161206162700'), ('20161206210809'), ('20161207141826'), ('20161207195423'), ('20170111035209'), ('20170113205236'), ('20170113211527'), ('20170119162206'), ('20170124141914'), ('20170126143117'), ('20170130154455'), ('20170207132639'), ('20170213151834'), ('20170308231108'), ('20170309133944'), ('20170312013804'), ('20170501194857'), ('20170502184027');


