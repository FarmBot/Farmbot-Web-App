describe RmqConfigWriter do
  it "should warn you about missing ADMIN_PASSWORD" do
    expect(STDOUT).to receive(:puts).with(RmqConfigWriter::ENV_WARNING)
    RmqConfigWriter.dont_render
  end
end
