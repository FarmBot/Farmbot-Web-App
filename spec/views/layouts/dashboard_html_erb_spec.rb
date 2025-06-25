require 'json'
require 'nokogiri'

RSpec.describe "layouts/dashboard.html.erb", type: :view do
  before do
    allow(view).to receive(:render).and_call_original
    allow(view).to receive(:render).with("addons").and_return("")
    assign(:css_assets, [])
    assign(:js_assets, [])
    assign(:global_config, '{}')
    allow(view).to receive(:content_for?).with(:head).and_return(false)
    allow(view).to receive(:content_for).with(:head).and_return("")
    allow(view).to receive(:stylesheet_link_tag).and_return("")
    allow(view).to receive(:javascript_include_tag).and_return("")
  end

  def render_with_api_host(api_host)
    stub_const('ENV', ENV.to_hash.merge('API_HOST' => api_host))
    render template: "layouts/dashboard.html.erb"
  end

  def manifest_href_from_rendered_html
    Nokogiri::HTML(rendered)
      .at_css('link[rel="manifest"]')
      &.[]('href')
  end

  def read_manifest_from_rendered_html
    href = manifest_href_from_rendered_html
    raise "Manifest link not found in rendered HTML" unless href
    manifest_path = Rails.root.join("public", href.delete_prefix("/"))
    JSON.parse(File.read(manifest_path))
  end

  [
    { host: "my.farm.bot",      name: "FarmBot",          icon: "pwa_icon_production.png" },
    { host: "staging.farm.bot", name: "FarmBot Staging",  icon: "pwa_icon_staging.png"   },
    { host: "localhost",        name: "FarmBot Local",    icon: "pwa_icon_local.png"     }
  ].each do |cfg|
    it "includes correct manifest for #{cfg[:host]}" do
      render_with_api_host(cfg[:host])
      manifest = read_manifest_from_rendered_html
      expect(manifest["name"]).to eq(cfg[:name])
      expect(manifest["icons"][0]["src"]).to include(cfg[:icon])
    end
  end
end
