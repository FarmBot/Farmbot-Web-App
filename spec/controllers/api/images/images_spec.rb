require 'spec_helper'
{:verb=>"POST",
 :url=>"//storage.googleapis.com/farmbot-team/",
 :form_data=>
  {:key=>"temp1/ba8a09f1-e80d-40c7-9b57-6c94927440fd.jpg",
   :acl=>"public-read",
   :"Content-Type"=>"image/jpeg",
   :policy=>
    "eyJleHBpcmF0aW9uIjoiMjAxOC0wMi0yNlQxODozNTo0NFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJmYXJtYm90LXRlYW0ifSx7ImtleSI6InRlbXAxL2JhOGEwOWYxLWU4MGQtNDBjNy05YjU3LTZjOTQ5Mjc0NDBmZC5qcGcifSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJDb250ZW50LVR5cGUiOiJpbWFnZS9qcGVnIn0sWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMSw3MzQwMDMyXV19",
   :signature=>"mmuv57hxWgiaSu0wMzjCNK5CRAU=",
   :GoogleAccessId=>"GOOGOC5BHEGEQLVFBDCB",
   :file=>"REPLACE_THIS_WITH_A_BINARY_JPEG_FILE"},
 :instructions=>
  "Send a 'from-data' request to the URL provided.Then POST the resulting URL as an 'attachment_url' (json) to api/images/."}
describe Api::ImagesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  it "Creates a polict object" do
    sign_in user
    get :storage_auth

    expect(response.status).to eq(200)
    expect(json).to be_kind_of(Hash)
    expect(json[:verb]).to eq("POST")
    expect(json[:url]).to include("googleapis")
    expect(json[:form_data].keys.sort).to include(:signature)
    expect(json[:instructions])
      .to include("POST the resulting URL as an 'attachment_url'")
  end

  describe '#index' do
    it 'shows only the max images allowed' do
      sign_in user
      device = user.device
      # Using the *real* value (10) was super slow (~30 seconds)
      device.update_attributes!(max_images_count: 1)
      FactoryBot.create_list(:image, 2, device: user.device)
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(device.max_images_count)
      expect(json.first.key?(:attachment_url)).to be_truthy
    end
  end

  describe '#show' do
    it 'shows image meta data' do
      sign_in user
      image = FactoryBot.create(:image, device: user.device)
      get :show, params: { id: image.id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(image.id)
      expect(json[:device_id]).to eq(user.device_id)
      expect(json[:meta]).to be_truthy
      expect(json.key?(:attachment_url)).to be_truthy
    end
  end

  describe "#create" do
    it 'creates one image' do
      sign_in user
      before_count = Image.count
      post :create,
           body: { attachment_url: "https://placeholdit.imgix.net/~text?txt"\
                                   "size=5&txt=1%C3%971&w=1&h=1&txtpad=1",
                   meta: { x: 1, z: 3 } }.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(Image.count).to be > before_count
      expect(json[:device_id]).to eq(user.device.id)
      expect(json.key?(:attachment_processed_at)).to be_truthy
      expect(json[:attachment_url]).to include("placehold")
      expect(json.dig :meta, :x).to eq(1)
      expect(json.dig :meta, :y).to eq(nil)
      expect(json.dig :meta, :z).to eq(3)
    end

    describe '#delete' do
      it 'deletes an image' do
        sign_in user
        image = FactoryBot.create(:image, device: user.device)
        before_count = Image.count
        run_jobs_now do
          delete :destroy, params: { id: image.id }
        end
        expect(response.status).to eq(200)
        expect(Image.count).to be < before_count
      end
    end
  end
end
