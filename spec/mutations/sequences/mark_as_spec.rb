require "spec_helper"

describe Sequences::Destroy do
  let(:device) { FactoryBot.create(:device) }
  let(:weed) { FactoryBot.create(:weed, device: device) }
  let(:tool) { FactoryBot.create(:tool, device: device) }
  let(:plant) { FactoryBot.create(:plant, device: device) }

  let!(:sequence) do
    json = Sequences::Create.run!({
      device: device,
      name: "testcase123",
      kind: "sequence",
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {},
          body: [
            { kind: "variable_declaration",
             args: {
              label: "parent",
              data_value: {
                kind: "point",
                args: {
                  pointer_id: weed.id,
                  pointer_type: "Weed",
                },
              },
            } },
          ],
        },
      },
      body: [
        {
          kind: "update_resource",
          args: {
            resource: {
              kind: "resource",
              args: { resource_type: "Device", resource_id: device.id },
            },
          },
          body: [
            {
              kind: "pair",
              args: { label: "mounted_tool_id", value: tool.id },
            },
          ],
        },
        {
          kind: "update_resource",
          args: {
            resource: {
              kind: "resource",
              args: {
                resource_id: plant.id,
                resource_type: "Plant",
              },
            },
          },
          body: [
            {
              kind: "pair",
              args: {
                value: "planted",
                label: "plant_stage",
              },
            },
          ],
        },
        {
          kind: "update_resource",
          args: {
            resource: {
              kind: "identifier",
              args: {
                label: "parent",
              },
            },
          },
          body: [
                  {
                    kind: "pair",
                    args: {
                      value: "sprouted",
                      label: "plant_stage",
                    },
                  },
                ],
        },
      ],
    })
    Sequence.find(json.fetch(:id))
  end

  it "Cant delete resource in use by a MARK AS step" do
    weed_result = Points::Destroy.run(point: weed, device: device)
    expect(weed_result.success?).to be false
    plant_result = Points::Destroy.run(point: plant, device: device)
    expect(plant_result.success?).to be false
    tool_result = Tools::Destroy.run(tool: tool, device: device)
    expect(tool_result.success?).to be false
  end
end
