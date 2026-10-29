import { Field, Section, Select } from './ControlPrimitives.jsx';

// 마이크 입력 장치. 오디오 인터페이스를 고르면 앰프 시뮬(Neural DSP 등)을 거치기 전 깨끗한 기타 소리를 들어서 더 정확하다.
export default function MicControls({ mic, device, setDevice }) {
  return (
    <div className="control-stack">
      <Section title="마이크">
        <Field label="입력 장치">
          <Select label="마이크 입력 장치" value={device} onChange={setDevice}>
            <option value="">기본 입력</option>
            {mic.devices.filter((item) => item.id && item.id !== 'default').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
          <p className="w-full text-xs leading-relaxed text-ink-soft">
            오디오 인터페이스의 기타 입력을 고르면 앰프 시뮬레이터를 거치기 전 깨끗한 소리를 들어서 가장 정확해요.
            장치 이름은 마이크를 한 번 켜서 권한을 허용하면 보여요.
          </p>
        </Field>
      </Section>
    </div>
  );
}
