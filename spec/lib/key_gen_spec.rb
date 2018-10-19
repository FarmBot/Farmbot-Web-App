require "spec_helper"
require "climate_control"

describe KeyGen do
  it "generates a key" do
    file = Tempfile.new("foo")
    result = KeyGen.generate_new_key(file)
    expect(result.to_pem).to eq(file.read)
    file.close
    file.unlink
  end

  it "*sometimes* loads pems from a file" do
    path    = "/tmp/key_gen_foo"
    File.delete(path) if File.file?(path)
    result1 = KeyGen.try_file(path)
    expect(result1).to eq(nil)
    KeyGen.generate_new_key(path)
    result2 = KeyGen.try_file(path)
    expect(result2).to be_kind_of(OpenSSL::PKey::RSA)
  end

  it "loads PEMs from ENV" do
    ClimateControl.modify RSA_KEY: nil do
      expect(KeyGen.try_env).to eq(nil)
    end

    pem = OpenSSL::PKey::RSA.generate(2048).to_pem
    ClimateControl.modify RSA_KEY: pem do
      expect(KeyGen.try_env.to_pem).to eq(pem)
    end
  end

  # it "generates a new key when all other options are expended" do
  #   old_file = File.read(KeyGen::SAVE_PATH)
  #   File.delete(KeyGen::SAVE_PATH) if File.file?(KeyGen::SAVE_PATH)
  #   expect(File.file?(KeyGen::SAVE_PATH))
  #   KeyGen.instance_variable_set("@current", nil)
  #   ClimateControl.modify RSA_KEY: nil do
  #     expect(KeyGen.current).to be_kind_of(OpenSSL::PKey::RSA)
  #   end
  #   File.write(KeyGen::SAVE_PATH, old_file)
  # end
end
