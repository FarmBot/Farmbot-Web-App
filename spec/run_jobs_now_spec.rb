require "spec_helper"

describe "run_jobs_now" do
  around do |example|
    original_delay_jobs = Delayed::Worker.delay_jobs
    example.run
  ensure
    Delayed::Worker.delay_jobs = original_delay_jobs
  end

  [true, false].each do |delay_jobs|
    context "when delay_jobs starts as #{delay_jobs}" do
      before do
        Delayed::Worker.delay_jobs = delay_jobs
      end

      it "runs jobs immediately and restores the setting after success" do
        result = run_jobs_now do
          expect(Delayed::Worker.delay_jobs).to eq(false)
          :completed
        end

        expect(result).to eq(:completed)
        expect(Delayed::Worker.delay_jobs).to eq(delay_jobs)
      end

      it "restores the setting and propagates errors after failure" do
        expect {
          run_jobs_now do
            expect(Delayed::Worker.delay_jobs).to eq(false)
            raise "job block failed"
          end
        }.to raise_error(RuntimeError, "job block failed")

        expect(Delayed::Worker.delay_jobs).to eq(delay_jobs)
      end
    end
  end
end
