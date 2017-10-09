%%% Fetch an encryption key from the FarmBot server.

-module(rabbit_auth_backend_jwt_pub_key_fetcher).
-behaviour(gen_server).

%% GenServer
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

%% API
-export([start_link/0, fetch/0]).

%% Fetch and store the key.
start_link() ->
  gen_server:start_link({global, ?MODULE}, ?MODULE, [], [{name, ?MODULE}]).

%% Fetch the key from memory.
fetch() ->
  gen_server:call({global, ?MODULE}, fetch).

init([]) ->
  % HTTP get
  {ok, Url} = application:get_env(rabbit_auth_backend_jwt, farmbot_api_key_url),
  io:fwrite("Trying to fetch public key from: ~s\n", [Url]),


  case httpc:request(get, {Url, [{"connection", "close"}]}, [], [{body_format, binary}]) of
    {ok, {{_, 200, _}, _, PubKeyBin }} ->
      [RSAEntry] = public_key:pem_decode(PubKeyBin),
      RSAKey = public_key:pem_entry_decode(RSAEntry),
      {ok, RSAKey};
    Error                         -> {stop, Error}
  end.

handle_call(fetch, _Arg, Key) -> {reply, {ok, Key}, Key}.

handle_cast(_Cast, Key) -> {noreply, Key}.

handle_info(_Info, Key) -> {noreply, Key}.

terminate(_, _) -> ok.

code_change(_OldVersion, Library, _Extra) -> {ok, Library}.
