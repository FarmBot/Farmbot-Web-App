require "spec_helper"

describe "Active Job adapter behavior" do
  let(:job_class) do
    stub_const("InlineProbeJob", Class.new(ApplicationJob) do
      queue_as :default

      def perform(payload)
        Rails.cache.write("inline_probe", payload)
      end
    end)
  end

  after do
    Rails.cache.delete("inline_probe")
  end

  it "uses the inline adapter in test and executes perform_later immediately" do
    expect(ActiveJob::Base.queue_adapter.class.name).to eq("ActiveJob::QueueAdapters::InlineAdapter")

    expect {
      job_class.perform_later("ok")
    }.to change { Rails.cache.read("inline_probe") }.from(nil).to("ok")
  end
end
